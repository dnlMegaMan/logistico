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

// GrabarSolicitudConsumo is...
func GrabarSolicitudConsumo(w http.ResponseWriter, r *http.Request) {
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
	var msg models.SolicitudConsumo
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
	res := models.SolicitudConsumo{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.USUARIO)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	db, _ := database.GetConnection(res.SERVIDOR)
	var valores models.SolicitudConsumo

	var secuencia int
	var secuenciaDetalle int
	var query string
	secuencia = 0
	valor, err := ObtenerClinFarParamGeneral(db, "usaPCKGraSolCon")
	if err != nil {
		http.Error(w, "Error interno del servidor", http.StatusInternalServerError)
		logger.Error(logs.InformacionLog{
			Mensaje: "Error al obtener el valor del parametro",
			Error:   err,
		})
		return
	}

	if valor == "SI" {
		logger.Trace(logs.InformacionLog{Mensaje: "Entro en la solucion GRABAR_SOLICITUD_CONSUMO"})
		jsonEntrada, _ := json.Marshal(res)
		In_Json := string(jsonEntrada)
		jsonDetalle, _ := json.Marshal(res.DETSOLICTUDCONSUMO)
		res1 := strings.Replace(string(jsonDetalle), "{\"detsolicitudconsumo\":", "", 3)
		In_Detalle := strings.Replace(string(res1), "}]}", "}]", 22)
		transaccion, err := db.Begin()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "No puede crear transaccion para devolver GRABAR_SOLICITUD_CONSUMO",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		qry := "BEGIN PKG_GRABAR_SOLICITUD_CONSUMO.P_GRABAR_SOLICITUD_CONSUMO(:1,:2,:3); END;"

		logger.Trace(logs.InformacionLog{
			Query:   qry,
			Mensaje: "Ejecucion Package GRABAR_SOLICITUD_CONSUMO",
		})
		_, err = transaccion.Exec(qry,
			PlSQLArrays,
			In_Json,                   //:1
			In_Detalle,                //:2
			sql.Out{Dest: &secuencia}, //:3
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   qry,
				Mensaje: "Fallo package GRABAR_SOLICITUD_CONSUMO",
				Error:   err,
				Contexto: map[string]interface{}{
					":1": In_Json,
					":2": In_Detalle,
					":3": secuencia,
				},
			})

			errRollback := transaccion.Rollback()
			if errRollback != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo rollback package GRABAR_SOLICITUD_CONSUMO",
					Error:   errRollback,
				})
			}

			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		err = transaccion.Commit()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo commit GRABAR_SOLICITUD_CONSUMO",
				Error:   err,
			})
			defer transaccion.Rollback()
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	} else {
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje:  "Se cayo conexion base de datos",
				Error:    err,
				Contexto: map[string]interface{}{"servidor": res.SERVIDOR},
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		if res.ACCION == "I" {
			secuencia, err = GeneraSecuencia(res.SERVIDOR, "CLIN_SOLICITUDCONSUMO_SEQ.NEXTVAL")
			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo genera secuencia",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			query = "insert into CLIN_FAR_SOLICITUDCONSUMO  (ID,HDGCODIGO,ESACODIGO,CMECODIGO,CENTROCOSTO,ID_PRESUPUESTO,GLOSA,FECHA_SOLICITUD,REFERENCIA_CONTABLE,OPERACION_CONTABLE,ESTADO,PRIORIDAD,USUARIO_SOLICITA,USUARIO_AUTORIZA,ERROR_ERP) "
			query = query + " VALUES ("
			query = query + strconv.Itoa(secuencia)
			query = query + "," + strconv.Itoa(res.HDGCODIGO)
			query = query + "," + strconv.Itoa(res.ESACODIGO)
			query = query + "," + strconv.Itoa(res.CMECODIGO)
			query = query + "," + strconv.Itoa(res.CENTROCOSTO)
			query = query + "," + strconv.Itoa(res.IDPRESUPUESTO)
			query = query + ",'" + res.GLOSA + "'"
			query = query + ", sysdate"
			//query = query + ",'" + res.FECHA_ENVIO_SOLICITUD + "'"
			query = query + "," + strconv.Itoa(res.REFERENCIACONTABLE)
			query = query + "," + strconv.Itoa(res.OPERACIONCONTABLE)
			query = query + "," + strconv.Itoa(res.ESTADO)
			query = query + "," + strconv.Itoa(res.PRIORIDAD)
			query = query + ",'" + res.USUARIOSOLICITA + "'"
			query = query + ",'" + res.USUARIOAUTORIZA + "'"
			query = query + ",'" + res.USUARIOAUTORIZA + "'"
			query = query + " )"

			ctx := context.Background()
			rowsIns, err := db.QueryContext(ctx, query)

			logger.Trace(logs.InformacionLog{
				Query:   query,
				Mensaje: "Query crear solicitud de consumo",
			})

			if err != nil {
				logger.Error(logs.InformacionLog{
					Query:   query,
					Mensaje: "Se cayo query crear solicitud de consumo",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			defer rowsIns.Close()
		}

		if res.ACCION == "M" {
			query = "update CLIN_FAR_SOLICITUDCONSUMO"
			query = query + " set CENTROCOSTO = " + strconv.Itoa(res.CENTROCOSTO)
			query = query + ", ID_PRESUPUESTO =  " + strconv.Itoa(res.IDPRESUPUESTO)
			query = query + ", GLOSA   = '" + res.GLOSA + "'"
			//query = query + ", FECHA_SOLICITUD = '" + res.FECHA_SOLICITUD + "'"
			//query = query + ", FECHA_ENVIO_SOLICITUD = '" + res.FECHA_ENVIO_SOLICITUD + "'"
			query = query + ", REFERENCIA_CONTABLE =  " + strconv.Itoa(res.REFERENCIACONTABLE)
			query = query + ", OPERACION_CONTABLE =  " + strconv.Itoa(res.OPERACIONCONTABLE)
			query = query + ", ESTADO =  " + strconv.Itoa(res.ESTADO)
			query = query + ", PRIORIDAD = " + strconv.Itoa(res.PRIORIDAD)
			query = query + ", USUARIO_SOLICITA = '" + res.USUARIOSOLICITA + "'"
			query = query + ", USUARIO_AUTORIZA = '" + res.USUARIOAUTORIZA + "'"
			query = query + " where ID = " + strconv.Itoa(res.ID)

			ctx := context.Background()
			rowsUp, err := db.QueryContext(ctx, query)

			logger.Trace(logs.InformacionLog{
				Query:   query,
				Mensaje: "Query actualizar solicitud de consumo",
			})

			if err != nil {
				logger.Error(logs.InformacionLog{
					Query:   query,
					Mensaje: "Se cayo query actualizar solicitud de consumo",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			defer rowsUp.Close()
		}

		if res.ACCION == "E" {
			query = "delete CLIN_FAR_DETSOLICITUDCONSUMO"
			query = query + " where ID = " + strconv.Itoa(res.ID)

			query = "delete CLIN_FAR_SOLICITUDCONSUMO"
			query = query + " where ID = " + strconv.Itoa(res.ID)

			ctx := context.Background()
			rowsUpd, err := db.QueryContext(ctx, query)

			logger.Trace(logs.InformacionLog{
				Query:   query,
				Mensaje: "Query eliminar solicitud de consumo",
			})

			if err != nil {
				logger.Error(logs.InformacionLog{
					Query:   query,
					Mensaje: "Se cayo query eliminar solicitud de consumo",
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

		detallesolicitud := res.DETSOLICTUDCONSUMO

		for i := range detallesolicitud {
			qryUpd1 = ""
			transaccionDetalle = 1

			if detallesolicitud[i].ACCION == "I" {
				insertando = 1
				secuenciaDetalle, err = GeneraSecuencia(res.SERVIDOR, "CLIN_SOLICITUDCONSUMODET_SEQ.NEXTVAL")
				if err != nil {
					logger.Error(logs.InformacionLog{
						Mensaje: "Se cayo genera secuencia",
						Error:   err,
					})
					http.Error(w, err.Error(), http.StatusInternalServerError)
					return
				}

				qryIns1 = qryIns1 + "into CLIN_FAR_DETSOLICITUDCONSUMO (ID_DETAELLE, ID,CENTROCOSTO,ID_PRESUPUESTO,ID_PRODUCTO,CODIGO_PRODUCTO,GLOSA_PRODUCTO,CANTIDAD_SOLICITADA,CANTIDAD_RECEPCIONADA,REFERENCIA_CONTABLE,OPERACION_CONTABLE,ESTADO,PRIORIDAD,USUARIO_SOLICITA,USUARIO_AUTORIZA, HDGCODIGO,ESACODIGO,CMECODIGO "
				qryIns1 = qryIns1 + ") values (  "
				qryIns1 = qryIns1 + strconv.Itoa(secuenciaDetalle)
				if secuencia == 0 {
					qryIns1 = qryIns1 + " ," + strconv.Itoa(res.ID)
				} else {
					qryIns1 = qryIns1 + " ," + strconv.Itoa(secuencia)
				}

				qryIns1 = qryIns1 + " ," + strconv.Itoa(detallesolicitud[i].CENTROCOSTO)
				qryIns1 = qryIns1 + " ," + strconv.Itoa(detallesolicitud[i].IDPRESUPUESTO)
				qryIns1 = qryIns1 + " ," + strconv.Itoa(detallesolicitud[i].IDPRODUCTO)
				qryIns1 = qryIns1 + " ,'" + detallesolicitud[i].CODIGOPRODUCTO + "'"
				qryIns1 = qryIns1 + " ,'" + detallesolicitud[i].GLOSAPRODUCTO + "'"
				qryIns1 = qryIns1 + " ," + strconv.Itoa(detallesolicitud[i].CANTIDADSOLICITADA)
				qryIns1 = qryIns1 + " ," + strconv.Itoa(detallesolicitud[i].CANTIDADRECEPCIONADA)
				qryIns1 = qryIns1 + " ," + strconv.Itoa(detallesolicitud[i].REFERENCIACONTABLE)
				qryIns1 = qryIns1 + " ," + strconv.Itoa(detallesolicitud[i].OPERACIONCONTABLE)
				qryIns1 = qryIns1 + " ," + strconv.Itoa(detallesolicitud[i].ESTADO)
				qryIns1 = qryIns1 + " ," + strconv.Itoa(detallesolicitud[i].PRIORIDAD)
				qryIns1 = qryIns1 + " ,'" + detallesolicitud[i].USUARIOSOLICITA + "'"
				qryIns1 = qryIns1 + " ,'" + detallesolicitud[i].USUARIOAUTORIZA + "'"
				qryIns1 = qryIns1 + " ," + strconv.Itoa(res.HDGCODIGO)
				qryIns1 = qryIns1 + " ," + strconv.Itoa(res.ESACODIGO)
				qryIns1 = qryIns1 + " ," + strconv.Itoa(res.CMECODIGO)
				qryIns1 = qryIns1 + " )   "

			}

			if detallesolicitud[i].ACCION == "E" {
				qryUpd1 = qryUpd1 + " delete CLIN_FAR_DETSOLICITUDCONSUMO "
				qryUpd1 = qryUpd1 + " Where ID_DETAELLE =" + strconv.Itoa(detallesolicitud[i].IDDETAELLE)
				qryUpd1 = qryUpd1 + ";"

			}

			if detallesolicitud[i].ACCION == "M" {
				qryUpd1 = qryUpd1 + " UPDATE CLIN_FAR_DETSOLICITUDCONSUMO"
				qryUpd1 = qryUpd1 + " set CENTROCOSTO =" + strconv.Itoa(detallesolicitud[i].CENTROCOSTO)
				qryUpd1 = qryUpd1 + " , ID_PRESUPUESTO =" + strconv.Itoa(detallesolicitud[i].IDPRESUPUESTO)
				qryUpd1 = qryUpd1 + " , ID_PRODUCTO =" + strconv.Itoa(detallesolicitud[i].IDPRODUCTO)
				qryUpd1 = qryUpd1 + " , CODIGO_PRODUCTO ='" + detallesolicitud[i].CODIGOPRODUCTO + "'"
				qryUpd1 = qryUpd1 + " , GLOSA_PRODUCTO ='" + detallesolicitud[i].GLOSAPRODUCTO + "'"
				qryUpd1 = qryUpd1 + " , CANTIDAD_SOLICITADA =" + strconv.Itoa(detallesolicitud[i].CANTIDADSOLICITADA)
				qryUpd1 = qryUpd1 + " , CANTIDAD_RECEPCIONADA =" + strconv.Itoa(detallesolicitud[i].CANTIDADRECEPCIONADA)
				qryUpd1 = qryUpd1 + " , REFERENCIA_CONTABLE =" + strconv.Itoa(detallesolicitud[i].REFERENCIACONTABLE)
				qryUpd1 = qryUpd1 + " , OPERACION_CONTABLE =" + strconv.Itoa(detallesolicitud[i].OPERACIONCONTABLE)
				qryUpd1 = qryUpd1 + " , ESTADO =" + strconv.Itoa(detallesolicitud[i].ESTADO)
				qryUpd1 = qryUpd1 + " , PRIORIDAD =" + strconv.Itoa(detallesolicitud[i].PRIORIDAD)
				qryUpd1 = qryUpd1 + " , USUARIO_SOLICITA = '" + detallesolicitud[i].USUARIOSOLICITA + "'"
				qryUpd1 = qryUpd1 + " where  ID_DETAELLE=" + strconv.Itoa(detallesolicitud[i].IDDETAELLE)
				qryUpd1 = qryUpd1 + " AND HDGCODIGO = " + strconv.Itoa(res.HDGCODIGO)
				qryUpd1 = qryUpd1 + " AND ESACODIGO = " + strconv.Itoa(res.ESACODIGO)
				qryUpd1 = qryUpd1 + " AND CMECODIGO = " + strconv.Itoa(res.CMECODIGO)
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
				Mensaje: "Query transaccion detalle solicitud de consumo",
			})

			if err != nil {
				logger.Error(logs.InformacionLog{
					Query:   query,
					Mensaje: "Se cayo query transaccion detalle solicitud de consumo",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			defer rowsT.Close()
		}
		//-------------------------------------------------------------------------
		// defer db.Close()

	}

	if secuencia != 0 {
		valores.ID = secuencia
	} else {
		valores.ID = res.ID
	}

	var retornoValores models.SolicitudConsumo = valores

	go LlamadaWSLogIntegraPedidoERP(res.HDGCODIGO, res.SERVIDOR, secuencia, "CON")

	json.NewEncoder(w).Encode(retornoValores)
	models.EnableCors(&w)
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
