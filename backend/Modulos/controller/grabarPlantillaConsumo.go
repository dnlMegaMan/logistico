package controller

import (
	"context"
	"database/sql"
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

// GrabarPlantillaConsumo is...
func GrabarPlantillaConsumo(w http.ResponseWriter, r *http.Request) {
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
	var msg models.PlantillaConsumo
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
	w.Header().Set("Content-Type", "application/json")
	res := models.PlantillaConsumo{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.USUARIO)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})
	//  var PUsuario  string

	var PiServidor string

	//  PUsuario   = res.PiUsuario
	PiServidor = res.SERVIDOR

	db, _ := database.GetConnection(PiServidor)
	secuencia := 0
	valor, err := ObtenerClinFarParamGeneral(db, "usaPCKGraPlaCon")
	if err != nil {
		http.Error(w, "Error interno del servidor", http.StatusInternalServerError)
		logger.Error(logs.InformacionLog{
			Mensaje: "Error al obtener el valor del parametro",
			Error:   err,
		})
		return
	}

	if valor == "SI" {
		logger.Trace(logs.InformacionLog{Mensaje: "Entro en la solucion GRABAR_PLANTILLA_CONSUMO"})
		jsonEntrada, _ := json.Marshal(res)
		In_Json := string(jsonEntrada)

		jsonEntradaDetalle, _ := json.Marshal(res.DETPLANTILLACONSUMO)
		res1 := strings.Replace(string(jsonEntradaDetalle), "{\"detplantillaconsumo\":", "", 3)
		In_Json_Detalle := strings.Replace(string(res1), "}]}", "}]", 22)
		transaccion, err := db.Begin()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "No puede crear transaccion para devolver GRABAR_PLANTILLA_CONSUMO",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		qry := "BEGIN PKG_GRABAR_PLANTILLA_CONSUMO.P_GRABAR_PLANTILLA_CONSUMO(:1,:2,:3); END;"

		logger.Trace(logs.InformacionLog{
			Query:   qry,
			Mensaje: "Ejecucion Package GRABAR_PLANTILLA_CONSUMO",
		})
		_, err = transaccion.Exec(qry,
			PlSQLArrays,
			In_Json,                   //:1
			In_Json_Detalle,           //:2
			sql.Out{Dest: &secuencia}, //:3
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   qry,
				Mensaje: "Fallo package GRABAR_PLANTILLA_CONSUMO",
				Error:   err,
				Contexto: map[string]interface{}{
					":1": In_Json,
					":2": In_Json_Detalle,
					":3": secuencia,
				},
			})

			errRollback := transaccion.Rollback()
			if errRollback != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo rollback package GRABAR_PLANTILLA_CONSUMO",
					Error:   errRollback,
				})
			}

			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		err = transaccion.Commit()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo commit GRABAR_PLANTILLA_CONSUMO",
				Error:   err,
			})
			defer transaccion.Rollback()
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	} else {

		var secuenciaDetalle int
		var query string

		if res.ACCION == "I" {
			secuencia, err = GeneraSecuencia(res.SERVIDOR, "CLIN_PLANTILLACONSUMO_SEQ.NEXTVAL")
			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo genera secuencia",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			query = "insert into CLIN_FAR_PLANTILLACONSUMO  (ID,HDGCODIGO,ESACODIGO,CMECODIGO,CENTROCOSTO,ID_PRESUPUESTO,GLOSA,REFERENCIA_CONTABLE,OPERACION_CONTABLE,ESTADO) "
			query = query + " VALUES ("
			query = query + strconv.Itoa(secuencia)
			query = query + "," + strconv.Itoa(res.HDGCODIGO)
			query = query + "," + strconv.Itoa(res.ESACODIGO)
			query = query + "," + strconv.Itoa(res.CMECODIGO)
			query = query + "," + strconv.Itoa(res.CENTROCOSTO)
			query = query + "," + strconv.Itoa(res.IDPRESUPUESTO)
			query = query + ",'" + res.GLOSA + "'"
			query = query + "," + strconv.Itoa(res.REFERENCIACONTABLE)
			query = query + "," + strconv.Itoa(res.OPERACIONCONTABLE)
			query = query + "," + strconv.Itoa(res.ESTADO)
			query = query + " )"
			ctx := context.Background()
			rowsIns, err := db.QueryContext(ctx, query)

			logger.Trace(logs.InformacionLog{
				Query:   query,
				Mensaje: "Query crear plantilla de consumo",
			})

			if err != nil {
				logger.Error(logs.InformacionLog{
					Query:   query,
					Mensaje: "Se cayo query crear plantilla de consumo",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			defer rowsIns.Close()
		}

		if res.ACCION == "M" {
			query = "update CLIN_FAR_PLANTILLACONSUMO"
			query = query + " set CENTROCOSTO = " + strconv.Itoa(res.CENTROCOSTO)
			query = query + ", ID_PRESUPUESTO =  " + strconv.Itoa(res.IDPRESUPUESTO)
			query = query + ", GLOSA   = '" + res.GLOSA + "'"
			query = query + ", REFERENCIA_CONTABLE =  " + strconv.Itoa(res.REFERENCIACONTABLE)
			query = query + ", OPERACION_CONTABLE =  " + strconv.Itoa(res.OPERACIONCONTABLE)
			query = query + ", ESTADO =  " + strconv.Itoa(res.ESTADO)
			query = query + " where ID = " + strconv.Itoa(res.ID)

			ctx := context.Background()
			rowsUp, err := db.QueryContext(ctx, query)

			logger.Trace(logs.InformacionLog{
				Query:   query,
				Mensaje: "Query actualizar plantilla de consumo",
			})

			if err != nil {
				logger.Error(logs.InformacionLog{
					Query:   query,
					Mensaje: "Se cayo query actualizar plantilla de consumo",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			defer rowsUp.Close()
		}

		if res.ACCION == "E" {
			query = "delete CLIN_FAR_DETPLANTILLACONSUMO"
			query = query + " where ID = " + strconv.Itoa(res.ID)

			query = "delete CLIN_FAR_PLANTILLACONSUMO"
			query = query + " where ID = " + strconv.Itoa(res.ID)

			ctx := context.Background()
			rowsUpd, err := db.QueryContext(ctx, query)

			logger.Trace(logs.InformacionLog{
				Query:   query,
				Mensaje: "Query eliminar plantilla de consumo",
			})

			if err != nil {
				logger.Error(logs.InformacionLog{
					Query:   query,
					Mensaje: "Se cayo query eliminar plantilla de consumo y detalle",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			defer rowsUpd.Close()
		}
		//-------------------   Graba Detalles
		qryUpd1 := ""
		qryIns1 := ""
		query = ""
		transaccionDetalle := 0
		insertando := 0
		//-------------------------------------------------------------------------

		detalleplantilla := res.DETPLANTILLACONSUMO

		for i := range detalleplantilla {
			qryUpd1 = ""
			transaccionDetalle = 1

			if detalleplantilla[i].ACCION == "I" {
				insertando = 1
				secuenciaDetalle, err = GeneraSecuencia(res.SERVIDOR, "CLIN_PLANTILLACONSUMODET_SEQ.NEXTVAL")
				if err != nil {
					logger.Error(logs.InformacionLog{
						Mensaje: "Se cayo genera secuencia",
						Error:   err,
					})
					http.Error(w, err.Error(), http.StatusInternalServerError)
					return
				}

				qryIns1 = qryIns1 + "into CLIN_FAR_DETPLANTILLACONSUMO (ID_DETAELLE, ID,CENTROCOSTO,ID_PRESUPUESTO,ID_PRODUCTO,CODIGO_PRODUCTO,GLOSA_PRODUCTO,CANTIDAD_SOLICITADA,OPERACION_CONTABLE,ESTADO, HDGCODIGO, ESACODIGO, CMECODIGO "
				qryIns1 = qryIns1 + ") values (  "
				qryIns1 = qryIns1 + strconv.Itoa(secuenciaDetalle)
				if secuencia == 0 {
					qryIns1 = qryIns1 + " ," + strconv.Itoa(res.ID)
				} else {
					qryIns1 = qryIns1 + " ," + strconv.Itoa(secuencia)
				}

				qryIns1 = qryIns1 + " ," + strconv.Itoa(detalleplantilla[i].CENTROCOSTO)
				qryIns1 = qryIns1 + " ," + strconv.Itoa(detalleplantilla[i].IDPRESUPUESTO)
				qryIns1 = qryIns1 + " ," + strconv.Itoa(detalleplantilla[i].IDPRODUCTO)
				qryIns1 = qryIns1 + " ,'" + detalleplantilla[i].CODIGOPRODUCTO + "'"
				qryIns1 = qryIns1 + " ,'" + detalleplantilla[i].GLOSAPRODUCTO + "'"
				qryIns1 = qryIns1 + " ," + strconv.Itoa(detalleplantilla[i].CANTIDADSOLICITADA)
				qryIns1 = qryIns1 + " ," + strconv.Itoa(detalleplantilla[i].OPERACIONCONTABLE)
				qryIns1 = qryIns1 + " ," + strconv.Itoa(detalleplantilla[i].ESTADO)
				qryIns1 = qryIns1 + " ," + strconv.Itoa(res.HDGCODIGO)
				qryIns1 = qryIns1 + " ," + strconv.Itoa(res.ESACODIGO)
				qryIns1 = qryIns1 + " ," + strconv.Itoa(res.CMECODIGO)
				qryIns1 = qryIns1 + " )   "

			}

			if detalleplantilla[i].ACCION == "E" {
				qryUpd1 = qryUpd1 + " delete CLIN_FAR_DETPLANTILLACONSUMO "
				qryUpd1 = qryUpd1 + " Where ID_DETAELLE =" + strconv.Itoa(detalleplantilla[i].IDDETAELLE)
				qryUpd1 = qryUpd1 + ";"

			}

			if detalleplantilla[i].ACCION == "M" {
				qryUpd1 = qryUpd1 + " UPDATE CLIN_FAR_DETPLANTILLACONSUMO"
				qryUpd1 = qryUpd1 + " set CENTROCOSTO =" + strconv.Itoa(detalleplantilla[i].CENTROCOSTO)
				qryUpd1 = qryUpd1 + " , ID_PRESUPUESTO =" + strconv.Itoa(detalleplantilla[i].IDPRESUPUESTO)
				qryUpd1 = qryUpd1 + " , ID_PRODUCTO =" + strconv.Itoa(detalleplantilla[i].IDPRODUCTO)
				qryUpd1 = qryUpd1 + " , CODIGO_PRODUCTO ='" + detalleplantilla[i].CODIGOPRODUCTO + "'"
				qryUpd1 = qryUpd1 + " , GLOSA_PRODUCTO ='" + detalleplantilla[i].GLOSAPRODUCTO + "'"
				qryUpd1 = qryUpd1 + " , CANTIDAD_SOLICITADA =" + strconv.Itoa(detalleplantilla[i].CANTIDADSOLICITADA)
				qryUpd1 = qryUpd1 + " , OPERACION_CONTABLE =" + strconv.Itoa(detalleplantilla[i].OPERACIONCONTABLE)
				qryUpd1 = qryUpd1 + " , ESTADO =" + strconv.Itoa(detalleplantilla[i].ESTADO)
				qryUpd1 = qryUpd1 + " where  ID_DETAELLE=" + strconv.Itoa(detalleplantilla[i].IDDETAELLE)
				qryUpd1 = qryUpd1 + " AND  HDGCODIGO=" + strconv.Itoa(res.HDGCODIGO)
				qryUpd1 = qryUpd1 + " AND  ESACODIGO=" + strconv.Itoa(res.ESACODIGO)
				qryUpd1 = qryUpd1 + " AND  CMECODIGO=" + strconv.Itoa(res.CMECODIGO)
				qryUpd1 = qryUpd1 + ";"

			}

			query = query + qryUpd1
		}
		//-------------------------------------------------------------------------

		if transaccionDetalle == 1 {

			if insertando == 1 {
				qryIns1 = "INSERT ALL " + qryIns1 + " SELECT * FROM DUAL;"
			}
			query = "BEGIN " + qryIns1 + query + " END;"

			ctx := context.Background()
			rowsT, err := db.QueryContext(ctx, query)

			logger.Trace(logs.InformacionLog{
				Query:   query,
				Mensaje: "Query transaccion detalle",
			})

			if err != nil {
				logger.Error(logs.InformacionLog{
					Query:   query,
					Mensaje: "Se cayo query transaccion detalle",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			defer rowsT.Close()
		}
	}

	// db, err := conectarBaseDeDatos(res.SERVIDOR)
	/*if err != nil {
		log.Println("ERROR (grabarplantillaconsumo): conectarBaseDeDatos: ", res.SERVIDOR)
		http.Error(w, err.Error(), 500)
		return
	}*/

	//-------------------------------------------------------------------------
	// defer db.Close()

	//log.Println("************************** parte final")

	var valores models.PlantillaConsumo
	if secuencia != 0 {
		valores.ID = secuencia
	} else {
		valores.ID = res.ID
	}
	//log.Println("************************** parte final", valores)
	var retornoValores models.PlantillaConsumo = valores

	json.NewEncoder(w).Encode(retornoValores)
	models.EnableCors(&w)
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
