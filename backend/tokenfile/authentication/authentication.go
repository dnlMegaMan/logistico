package authentication

import (
	"bytes"
	"crypto/rsa"
	"encoding/json"
	"fmt"
	ioutil "io"
	"net/http"
	"os"
	"strings"
	"time"

	jwt "github.com/dgrijalva/jwt-go"
	"github.com/dgrijalva/jwt-go/request"

	logs "sonda.com/logistico/logging"
	"sonda.com/logistico/tokenfile/models"
)

// -------------------------------------------------------------------------
var (
	privateKey *rsa.PrivateKey
	publicKey  *rsa.PublicKey
)

func init() {
	logger := logs.ObtenerLogger(logs.TokenLogger)
	logger.LoguearEntrada()

	privateBytes, err := os.ReadFile("./private.rsa")
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "No se pudo leer el archivo privado",
			Error:   err,
		})
	}

	publicBytes, err := os.ReadFile("./public.rsa.pub")
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "No se pudo leer el archivo publico",
			Error:   err,
		})
	}

	privateKey, err = jwt.ParseRSAPrivateKeyFromPEM(privateBytes)
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "No se pudo parsear privateKey",
			Error:   err,
		})
	}

	publicKey, err = jwt.ParseRSAPublicKeyFromPEM(publicBytes)
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "No se pudo parsear publicKey",
			Error:   err,
		})
	}

	logger.LoguearSalida()
}

// GenerateJWT is...
func GenerateJWT(user models.User) (string, error) {
	logger := logs.ObtenerLogger(logs.TokenLogger)
	logger.LoguearEntrada()

	claims := models.Claim{
		User: user,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: time.Now().Add(time.Minute * 30).Unix(),
			Issuer:    "Token generado con Exito",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodRS256, claims)
	result, err := token.SignedString(privateKey)
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "No se pudo firmar el token",
			Error:   err,
		})
		return "", err
	}

	logger.LoguearSalida()

	return result, nil
}

// Login is...
func Login(w http.ResponseWriter, r *http.Request) {
	logger := logs.ObtenerLogger(logs.TokenLogger)
	logger.LoguearEntrada()

	enableCors(&w)
	var user models.User
	var result models.ResponseToken

	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "Error al leer json de entrada",
			Error:   err,
		})
		http.Error(w, fmt.Sprintf("Error al leer el usuario %s", err.Error()), http.StatusInternalServerError)
		return
	}

	logger.Info(logs.InformacionLog{JSONEntrada: user, Mensaje: "JSON de entrada"})

	user.Password = ""

	token, err := GenerateJWT(user)
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "Error al generar el JWT",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	result.Token = token
	jsonResult, err := json.Marshal(result)
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "Error al generar el json de salida",
			Error:   err,
		})
		http.Error(w, "Error al generar el json de salida", http.StatusOK)
		return
	}
	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonResult)

	logger.LoguearSalida()
}

// ValidateToken is...
func ValidateToken(w http.ResponseWriter, r *http.Request) {
	logger := logs.ObtenerLogger(logs.TokenLogger)
	logger.LoguearEntrada()

	enableCors(&w)
	token, err := request.ParseFromRequestWithClaims(r, request.OAuth2Extractor, &models.Claim{}, func(token *jwt.Token) (interface{}, error) {
		return publicKey, nil
	})

	if err != nil {
		switch err.(type) {
		case *jwt.ValidationError:
			vErr := err.(*jwt.ValidationError)
			switch vErr.Errors {
			case jwt.ValidationErrorExpired:
				logger.Info(logs.InformacionLog{
					Mensaje: "Token ha expirado",
				})
				fmt.Fprintln(w, "Su token ha expirado")
				return
			case jwt.ValidationErrorSignatureInvalid:
				logger.Info(logs.InformacionLog{
					Mensaje: "Firma del token no coincide",
				})
				fmt.Fprintln(w, "La firma del token no coincide")
				return
			default:
				logger.Info(logs.InformacionLog{
					Mensaje: "Token no es válido",
					Error:   err,
				})
				fmt.Fprintln(w, "Su token no es válido")
				return
			}
		default:
			logger.Info(logs.InformacionLog{
				Mensaje: "Token no es válido",
				Error:   err,
			})
			fmt.Fprintln(w, "Su token no es válido")
			return
		}
	}

	if token.Valid {
		w.Header().Set("Content-Type", "application/json")

		// Read body
		b, err := ioutil.ReadAll(r.Body)
		defer r.Body.Close()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "No puede leer cuerpo de la peticion",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		// Unmarshal
		var msg models.User
		err = json.Unmarshal(b, &msg)

		if err != nil {
			if strings.ToUpper(r.Method) != "OPTIONS" { // Solo si no es un Pre-flight del chrome
				logger.Error(logs.InformacionLog{
					Mensaje: "No puede hacer unmarshal del JSON de entrada",
					Error:   err,
				})
			}

			http.Error(w, err.Error(), http.StatusOK)
			return
		}

		output, err := json.Marshal(msg)
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "No puede volver a crear JSON",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		//  w.Header().Set("Content-Type", "application/json")
		//  w.Write(output)

		res := models.User{}
		json.Unmarshal([]byte(output), &res)

		logger.SetUsuario(res.Name)
		logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

		var PUser string
		var PKey string
		var PRol string

		PUser = res.Name
		PKey = res.Password
		PRol = res.Role

		w.WriteHeader(http.StatusOK)

		tokenrsp, err := LlamadaGeneraToken(PUser, PKey, PRol)
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje:  "Error en llamada genera token",
				Error:    err,
				Contexto: map[string]interface{}{"PUser": PUser, "PKey": PKey, "PRol": PRol},
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		var retornoValores models.ResponseToken
		tokenrsp = strings.Replace(tokenrsp, "{\"token\":\"", "", 5)
		tokenrsp = strings.Replace(tokenrsp, "\"}", "", 5)
		tokenrsp = strings.Replace(tokenrsp, "\":\"", "", 5)
		retornoValores.Token = tokenrsp

		json.NewEncoder(w).Encode(retornoValores)

	} else {
		w.WriteHeader(http.StatusUnauthorized)
		fmt.Fprintln(w, "Su token no es válido")
	}

	logger.LoguearSalida()
}

// LlamadaGeneraToken is...
func LlamadaGeneraToken(inName string, inPassword string, inRole string) (value string, err error) {
	logger := logs.ObtenerLogger(logs.TokenLogger)
	logger.LoguearEntrada()

	// Establecer parametros de URL en la declaracion
	url := "http://localhost:8092/login"
	s := "{\"name\": \"" + inName + "\", \"password\": \"\", \"role\": \"" + inRole + "\"}"

	var jsonStr = []byte(s)

	logger.Trace(logs.InformacionLog{
		Mensaje:  "Body llamada a login",
		Contexto: map[string]interface{}{"body": s},
	})

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonStr))
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "Fallo crear request para generar token",
			Error:   err,
		})
		return "", err
	}
	req.Header.Set("X-Custom-Header", "myvalue")
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "Fallo envio request para generar token",
			Error:   err,
		})
		return "", err
	}
	defer resp.Body.Close()

	//fmt.Println("response Status:", resp.Status)
	//fmt.Println("response Headers:", resp.Header)
	body, _ := ioutil.ReadAll(resp.Body)
	value = string(body)

	logger.Trace(logs.InformacionLog{
		Mensaje:  "Body respuesta login",
		Contexto: map[string]interface{}{"body": value, "status": resp.Status, "header": resp.Header},
	})

	logger.LoguearSalida()

	return value, nil
}

func enableCors(w *http.ResponseWriter) {
	/*(*w).Header().Set("Access-Control-Allow-Origin", "*")
	(*w).Header().Set("Access-Control-Allow-Methods", "POST,GET,OPTIONS,PUT,DELETE,PATCH,HEAD")
	(*w).Header().Set("Access-Control-Allow-Headers", "Content-Type")*/

	(*w).Header().Set("Access-Control-Allow-Origin", "*")
	(*w).Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
	(*w).Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
}
