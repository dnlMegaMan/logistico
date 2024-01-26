package controller

import (
	"context"
	"encoding/json"
	ioutil "io"
	"net/http"
	"strconv"
	"strings"

	. "github.com/godror/godror"
	. "sonda.com/logistico/Modulos/comun"
	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"

	"sonda.com/logistico/Modulos/models"
)

// GrabarFactorConversionProducto is...
func GrabarFactorConversionProducto(w http.ResponseWriter, r *http.Request) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	models.EnableCors(&w)

	var (
		retornoValores models.GrabarFactorConversionProductoSalida
		queryI         string
	)
	retornoValores.Mensaje.MENSAJE = ""
	retornoValores.Mensaje.ESTADO = true
	retornoValores.Mensaje.FOLIO = 0

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
	var msg models.GrabarFactorConversionProductoEntrada
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

	res := models.GrabarFactorConversionProductoEntrada{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.Usuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	models.EnableCors(&w)
	det := res.Detalle
	db, _ := database.GetConnection(res.Servidor)
	transaccion := 0

	valor, err := ObtenerClinFarParamGeneral(db, "usaPCKGraFacConPro")
	if err != nil {
		http.Error(w, "Error interno del servidor", http.StatusInternalServerError)
		logger.Error(logs.InformacionLog{
			Mensaje: "Error al obtener el valor del parametro",
			Error:   err,
		})
		return
	}

	if valor == "SI" {
		logger.Trace(logs.InformacionLog{Mensaje: "Entro en la solucion GRABAR_FACTOR_CONVERSION_PRODUCTO"})

		jsonEntrada, _ := json.Marshal(res.Detalle)
		res1 := strings.Replace(string(jsonEntrada), "{\"factorconversionproductodetalle\":", "", 3)
		In_Json := strings.Replace(string(res1), "}]}", "}]", 22)
		transaccion, err := db.Begin()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "No puede crear transaccion para devolver GRABAR_FACTOR_CONVERSION_PRODUCTO",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		qry := "BEGIN PKG_GRABAR_FACTOR_CONVERSION_PRODUCTO.P_GRABAR_FACTOR_CONVERSION_PRODUCTO(:1,:2,:3,:4); END;"

		logger.Trace(logs.InformacionLog{
			Query:   qry,
			Mensaje: "Ejecucion Package GRABAR_FACTOR_CONVERSION_PRODUCTO",
		})
		_, err = transaccion.Exec(qry,
			PlSQLArrays,
			In_Json,       //:1
			res.HDGCodigo, //:2
			res.ESACodigo, //:3
			res.CMECodigo, //:4
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   qry,
				Mensaje: "Fallo package GRABAR_FACTOR_CONVERSION_PRODUCTO",
				Error:   err,
				Contexto: map[string]interface{}{
					":1": In_Json,
				},
			})

			errRollback := transaccion.Rollback()
			if errRollback != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo rollback package GRABAR_FACTOR_CONVERSION_PRODUCTO",
					Error:   errRollback,
				})
			}
			retornoValores.Mensaje.MENSAJE = err.Error()
			retornoValores.Mensaje.ESTADO = false
			retornoValores.Mensaje.FOLIO = 200
			http.Error(w, err.Error(), http.StatusOK)
			return
		}
		err = transaccion.Commit()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo commit GRABAR_FACTOR_CONVERSION_PRODUCTO",
				Error:   err,
			})
			defer transaccion.Rollback()
			retornoValores.Mensaje.MENSAJE = err.Error()
			retornoValores.Mensaje.ESTADO = false
			retornoValores.Mensaje.FOLIO = 200
			http.Error(w, err.Error(), http.StatusOK)
			return
		}
		retornoValores.Mensaje.MENSAJE = "GRABADO CORRECTAMENTE"
		retornoValores.Mensaje.ESTADO = true
		retornoValores.Mensaje.FOLIO = 200
	} else {
		for _, element := range det {
			strVal1 := 0
			queryS := " SELECT COUNT(*) "
			queryS = queryS + " FROM  CLIN_FAR_DISTRIB_COMPRAS "
			queryS = queryS + " WHERE DCOM_MEIN_ID_ORIGEN  = " + strconv.Itoa(element.PiMeInIdOrig)
			queryS = queryS + " AND   DCOM_MEIN_ID_DESTINO = " + strconv.Itoa(element.PiMeInIdDest)
			queryS = queryS + " AND  HDGCODIGO=" + strconv.Itoa(res.HDGCodigo)
			queryS = queryS + " AND  ESACODIGO=" + strconv.Itoa(res.ESACodigo)
			queryS = queryS + " AND  CMECODIGO=" + strconv.Itoa(res.CMECodigo)

			rows, err := db.Query(queryS)

			logger.Trace(logs.InformacionLog{
				Query:   queryS,
				Mensaje: "Query obtener distrib compras",
			})

			if err != nil {
				logger.Error(logs.InformacionLog{
					Query:   queryS,
					Mensaje: "Se cayo query obtener distrib compras",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			defer rows.Close()

			models.EnableCors(&w)
			for rows.Next() {
				err := rows.Scan(&strVal1)
				if err != nil {
					logger.Error(logs.InformacionLog{
						Mensaje: "Se cayo scan obtener distrib compras",
						Error:   err,
					})
					http.Error(w, err.Error(), http.StatusInternalServerError)
					return
				}
			}

			if strVal1 == 0 {
				transaccion = 1
				queryI = queryI + " INSERT INTO CLIN_FAR_DISTRIB_COMPRAS "
				queryI = queryI + " 	 (DCOM_MEIN_ID_ORIGEN, "
				queryI = queryI + " 	  DCOM_MEIN_ID_DESTINO, "
				queryI = queryI + " 	  DCOM_FACTOR_CONVERSION, "
				queryI = queryI + " 	  DCOM_VIGENTE, HDGCODIGO, ESACODIGO, CMECODIGO) "
				queryI = queryI + " VALUES (" + strconv.Itoa(element.PiMeInIdOrig) + ", "
				queryI = queryI + " 	  " + strconv.Itoa(element.PiMeInIdDest) + ", "
				queryI = queryI + " 	  " + strconv.Itoa(element.PiFactorConv) + ", "
				queryI = queryI + "'S',"
				queryI = queryI + " 	  " + strconv.Itoa(res.HDGCodigo) + ", "
				queryI = queryI + " 	  " + strconv.Itoa(res.ESACodigo) + ", "
				queryI = queryI + " 	  " + strconv.Itoa(res.CMECodigo)
				queryI = queryI + "); "
			} else {
				transaccion = 1
				queryI = queryI + " UPDATE CLIN_FAR_DISTRIB_COMPRAS  "
				queryI = queryI + " SET DCOM_FACTOR_CONVERSION =  " + strconv.Itoa(element.PiFactorConv)
				queryI = queryI + " WHERE "
				queryI = queryI + "     DCOM_MEIN_ID_ORIGEN =  " + strconv.Itoa(element.PiMeInIdOrig)
				queryI = queryI + " AND DCOM_MEIN_ID_DESTINO = " + strconv.Itoa(element.PiMeInIdDest)
				queryI = queryI + " AND  HDGCODIGO=" + strconv.Itoa(res.HDGCodigo)
				queryI = queryI + " AND  ESACODIGO=" + strconv.Itoa(res.ESACodigo)
				queryI = queryI + " AND  CMECODIGO=" + strconv.Itoa(res.CMECodigo)
				queryI = queryI + "; "
			}
		}

		if transaccion == 1 {
			queryI = "BEGIN " + queryI + " END;"

			ctx := context.Background()
			rowsT, err := db.QueryContext(ctx, queryI)

			logger.Trace(logs.InformacionLog{
				Query:   queryI,
				Mensaje: "Query transaccion grabar factor de conversion producto",
			})

			if err != nil {
				logger.Error(logs.InformacionLog{
					Query:   queryI,
					Mensaje: "Se cayo query transaccion grabar factor de conversion producto",
					Error:   err,
				})
				retornoValores.Mensaje.MENSAJE = err.Error()
				retornoValores.Mensaje.ESTADO = false
				retornoValores.Mensaje.FOLIO = 200
				http.Error(w, err.Error(), http.StatusOK)
				return
			}

			retornoValores.Mensaje.MENSAJE = "GRABADO CORRECTAMENTE"
			retornoValores.Mensaje.ESTADO = true
			retornoValores.Mensaje.FOLIO = 200
			defer rowsT.Close()
		}
	}

	json.NewEncoder(w).Encode(retornoValores)
	models.EnableCors(&w)
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
