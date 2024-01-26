package controller

import (
	"context"
	"encoding/json"
	ioutil "io"
	"math/rand"
	"net/http"
	"strconv"
	"strings"

	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"

	"sonda.com/logistico/Modulos/models"

	param "sonda.com/logistico/Modulos/comun"
)

// GrabaBodega is...
func GrabaBodega(w http.ResponseWriter, r *http.Request) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	models.EnableCors(&w)

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
	var msg models.ParamGrabaBodega
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
	// Marshal
	output, err := json.Marshal(msg)
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "No puede volver a crear JSON",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	//  w.Write(output)
	res := models.ParamGrabaBodega{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.PiUsuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	PiHDGCod := res.PiHDGCodigo
	PiESACod := res.PiESACodigo
	PiCMECod := res.PiCMECodigo
	PiCodBod := rand.Intn(100)
	PiDesBod := res.DesBodega
	PiCodNue := res.CodNuevo

	db, _ := database.GetConnection(res.PiServidor)

	if PiCodNue == "N" {
		/*resultinsertbodega, err := db.Exec("INSERT INTO CLIN_FAR_BODEGAS(fbod_codigo, HDGCodigo, ESACodigo, CMECodigo, fbod_descripcion, fbod_modificable, fbod_estado, fbod_tipo_bodega ) VALUES ( :PiCodBod, :PiHDGCod, :PiESACod, :PiCMECod, :PiDesBod, 'N', 'S', 'P' )", PiCodBod, PiHDGCod, PiESACod, PiCMECod, PiDesBod)
		if err != nil {
			log.Println("Error al Grabar en Clin_Far_Bodegas fbod_codigo ", PiCodBod)
			log.Println(err, resultinsertbodega)
			http.Error(w, err.Error(), 500)
		}*/
		query := ""
		query = "INSERT INTO CLIN_FAR_BODEGAS(fbod_codigo, HDGCodigo, ESACodigo, CMECodigo, fbod_descripcion, fbod_modificable"
		query = query + ", fbod_estado, fbod_tipo_bodega )"
		query = query + " VALUES ( " + strconv.Itoa(PiCodBod)
		query = query + ", " + strconv.Itoa(PiHDGCod)
		query = query + ", " + strconv.Itoa(PiESACod)
		query = query + ", " + strconv.Itoa(PiCMECod)
		query = query + ", '" + PiDesBod + "'"
		query = query + ", 'N'"
		query = query + ", 'S'"
		query = query + ", 'P')"

		valor, err := param.ObtenerClinFarParamGeneral(db, "usaPCKGraBod")
		if err != nil {
			http.Error(w, "Error interno del servidor", http.StatusInternalServerError)
			logger.Error(logs.InformacionLog{
				Mensaje: "Error al obtener el valor del parametro",
				Error:   err,
			})
			return
		}

		if valor == "SI" {
			logger.Info(logs.InformacionLog{Query: "Entro en la solucion [grabaBodega.go] por package PKG_GRABA_BODEGA.P_GRABA_BODEGA", Mensaje: "Entro en la solucion [grabaBodega.go] por package PKG_GRABA_BODEGA.P_GRABA_BODEGA"})

			qry := "BEGIN PKG_GRABA_BODEGA.P_GRABA_BODEGA(" + strconv.Itoa(PiCodBod) + "," +
				strconv.Itoa(PiHDGCod) + "," +
				strconv.Itoa(PiESACod) + "," +
				strconv.Itoa(PiCMECod) + ", '" + PiDesBod + "'); END;"
			ctx := context.Background()
			_, err = db.QueryContext(ctx, qry)

			logger.Trace(logs.InformacionLog{
				Query:   qry,
				Mensaje: "Ejecucion Package PKG_GRABA_BODEGA",
			})

			if err != nil {
				logger.Error(logs.InformacionLog{
					Query:   qry,
					Mensaje: "Se cayo Package PKG_GRABA_BODEGA",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
		} else {
			ctx := context.Background()
			resultinsertbodega, err := db.QueryContext(ctx, query)

			logger.Trace(logs.InformacionLog{
				Query:   query,
				Mensaje: "Query graba bodega",
			})

			if err != nil {
				logger.Error(logs.InformacionLog{
					Query:   query,
					Mensaje: "Se cayo query graba bodega",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			defer resultinsertbodega.Close()
		}
	}

	models.EnableCors(&w)
	json.NewEncoder(w).Encode(PiCodBod)
	w.Header().Set("Content-Type", "application/json")
	logger.LoguearSalida()
}
