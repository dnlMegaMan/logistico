package controller

import (
	"context"
	"encoding/json"
	ioutil "io"
	"net/http"
	"strconv"
	"strings"

	. "github.com/godror/godror"
	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"

	. "sonda.com/logistico/Modulos/comun"
	"sonda.com/logistico/Modulos/models"
)

// RecepcionDevolucionPac is...
func RecepcionDevolucionPac(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ParamDevolPaciente
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
	res := models.ParamDevolPaciente{}
	json.Unmarshal([]byte(output), &res)

	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	var i int
	var qry string

	models.EnableCors(&w)
	det := res.Detalle

	db, _ := database.GetConnection(res.PiServidor)
	valor, err := ObtenerClinFarParamGeneral(db, "usaPCKRecDevPac")
	if err != nil {
		http.Error(w, "Error interno del servidor", http.StatusInternalServerError)
		logger.Error(logs.InformacionLog{
			Mensaje: "Error al obtener el valor del parámetro",
			Error:   err,
		})
		return
	}

	//-------------------------------------------------------------------------
	qryUpd1 := ""
	qryIns1 := ""
	qryIns2 := ""
	qryIns3 := ""
	transaccion := 0
	query := ""
	//-------------------------------------------------------------------------

	// DETALLE  SOLICITUD
	if valor == "SI" {
		logger.Trace(logs.InformacionLog{Mensaje: "Entro en la solucion RECEPCION_DEVOLUCION_PAC"})
		jsonEntrada, _ := json.Marshal(det)
		res1 := strings.Replace(string(jsonEntrada), "{\"paramdetdevolpaciente\":", "", 3)
		In_Json := strings.Replace(string(res1), "}]}", "}]", 22)
		transaccion, err := db.Begin()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "No puede crear transaccion para devolver RECEPCION_DEVOLUCION_PAC",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		qry := "BEGIN PKG_RECEPCION_DEVOLUCION_PAC.P_RECEPCION_DEVOLUCION_PAC(:1,:2,:3); END;"

		logger.Trace(logs.InformacionLog{
			Query:   qry,
			Mensaje: "Ejecución Package RECEPCION_DEVOLUCION_PAC",
		})
		_, err = transaccion.Exec(qry,
			PlSQLArrays,
			In_Json,               //:1
			res.PiUsuarioDespacha, //:2
			res.CtaID,             //:3
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   qry,
				Mensaje: "Fallo package RECEPCION_DEVOLUCION_PAC",
				Error:   err,
				Contexto: map[string]interface{}{
					":1": In_Json,
					":2": res.PiUsuarioDespacha,
					":3": res.CtaID,
				},
			})

			errRollback := transaccion.Rollback()
			if errRollback != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo rollback package RECEPCION_DEVOLUCION_PAC",
					Error:   errRollback,
				})
			}

			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		err = transaccion.Commit()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo commit RECEPCION_DEVOLUCION_PAC",
				Error:   err,
			})
			defer transaccion.Rollback()
		}
		transaccion2, err := db.Begin()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "No puede crear transaccion para devolver RECEPCION_DEVOLUCION_PAC",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		qryInsert := "BEGIN PKG_RECEPCION_DEVOLUCION_PAC.P_INSERT_EVENTO_SOL(:1,:2); END;"

		logger.Trace(logs.InformacionLog{
			Query:   qry,
			Mensaje: "Ejecucion Package RECEPCION_DEVOLUCION_PAC P_INSERT_EVENTO_SOL",
		})
		_, err = transaccion2.Exec(qryInsert,
			PlSQLArrays,
			det[len(det)-1].PiSoliID, //:1
			res.PiUsuarioDespacha,    //:2
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   qry,
				Mensaje: "Fallo package RECEPCION_DEVOLUCION_PAC P_INSERT_EVENTO_SOL",
				Error:   err,
				Contexto: map[string]interface{}{
					":1": det[len(det)-1].PiSoliID,
					":2": res.PiUsuarioDespacha,
				},
			})

			errRollback := transaccion2.Rollback()
			if errRollback != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo rollback package RECEPCION_DEVOLUCION_PAC P_INSERT_EVENTO_SOL",
					Error:   errRollback,
				})
			}

			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		err = transaccion2.Commit()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo commit RECEPCION_DEVOLUCION_PAC",
				Error:   err,
			})
			defer transaccion2.Rollback()
		}
	} else {
		for i := range det {
			if det[i].PiCantidadAdevolver > 0 && det[i].PiCantidadAdevolver <= det[i].PiCantDispensada {
				qryUpd1 = ""
				qryIns1 = ""
				qryIns2 = ""
				qryIns3 = ""
				transaccion = 1

				//resupdsoldet, err := db.Exec("update clin_far_solicitudes_det set sode_cant_devo = (nvl(sode_cant_devo,0) + :PoCantDev), Sode_Estado = 2, Sode_Observaciones = :PoObserv Where sode_id = :PoSodeId And SODE_SOLI_ID = :PoSoliId", PoCanDev, PoObserv, PoSodeId, PoSoliId)
				qryUpd1 = qryUpd1 + " update clin_far_solicitudes_det"
				qryUpd1 = qryUpd1 + " set sode_cant_devo = (nvl(sode_cant_devo,0) + " + strconv.Itoa(det[i].PiCantidadAdevolver) + ")"
				qryUpd1 = qryUpd1 + " ,Sode_Estado = 78"
				qryUpd1 = qryUpd1 + " ,Sode_Observaciones = 'Actualiza recepcion devolucion paciente'"
				qryUpd1 = qryUpd1 + " Where sode_id = " + strconv.Itoa(det[i].PiSodeID)
				qryUpd1 = qryUpd1 + " And sode_soli_id = " + strconv.Itoa(det[i].PiSoliID)
				qryUpd1 = qryUpd1 + ";"
				/*ctx := context.Background()
				resupdsoldet, err := db.QueryContext(ctx, qry)
				if err != nil {
					//defer db.Close()
					log.Println("ERROR update clin_far_solicitudes_det  (recepciondevolucionpaciente) qry:  ", qry)
					log.Println(err, resupdsoldet)
					http.Error(w, err.Error(), 500)
				}
				defer resupdsoldet.Close()*/

				// Evento Det Sol
				qryIns1 = qryIns1 + " insert into CLIN_FAR_DETEVENTOSOLICITUD (SODE_ID, SOLI_ID, CODEVENTO, FECHA, OBSERVACION, CANTIDAD, USUARIO, LOTE, FECHAVTO) values ("
				qryIns1 = qryIns1 + strconv.Itoa(det[i].PiSodeID)
				qryIns1 = qryIns1 + ", " + strconv.Itoa(det[i].PiSoliID)
				qryIns1 = qryIns1 + ", " + strconv.Itoa(75)
				qryIns1 = qryIns1 + ", sysdate"
				qryIns1 = qryIns1 + ", " + "'Actualiza detalle solicitud devolucion paciente'"
				qryIns1 = qryIns1 + ", " + strconv.Itoa(det[i].PiCantidadAdevolver)
				qryIns1 = qryIns1 + ", '" + res.PiUsuarioDespacha + "'"
				qryIns1 = qryIns1 + ", '" + det[i].PiLote + "'"
				qryIns1 = qryIns1 + ", to_date('" + det[i].PiFechaVto + "','YYYY-MM-DD')      )"
				qryIns1 = qryIns1 + ";"
				/*ctx = context.Background()
				rows_modifica, err := db.QueryContext(ctx, qry)
				if err != nil {
					//defer db.Close()
					log.Println("ERROR insert CLIN_FAR_DETEVENTOSOLICITUD P (recepciondevolucionpaciente): ", qry)
					log.Println(err, rows_modifica)
					http.Error(w, err.Error(), 500)
				}
				defer rows_modifica.Close()*/

				NuevoIDMDev := GeneraNuevoIDMDev(res.PiServidor)
				VMDevID := NuevoIDMDev

				//resinsmovim, err := db.Exec("INSERT INTO clin_far_movim_devol ( MDEV_MFDE_ID, MDEV_MOVF_TIPO, MDEV_FECHA, MDEV_CANTIDAD, MDEV_RESPONSABLE, MDEV_CTAS_ID ) values ( :MfDeId, 2, sysdate, :PoCanDev, :PRespons, :PoCtaCId)", MfDeId, PoCanDev, PRespons, PoCtaCId)
				qryIns2 = qryIns2 + "INSERT INTO clin_far_movim_devol (MDEV_ID, mdev_mfde_id, mdev_movf_tipo, mdev_fecha, mdev_cantidad, mdev_responsable, mdev_ctas_id) values ( "
				qryIns2 = qryIns2 + strconv.Itoa(VMDevID)
				qryIns2 = qryIns2 + " ," + strconv.Itoa(det[i].PiIDMovimientoDet)
				qryIns2 = qryIns2 + " ,60"
				qryIns2 = qryIns2 + " ,sysdate"
				qryIns2 = qryIns2 + " ," + strconv.Itoa(det[i].PiCantidadAdevolver)
				qryIns2 = qryIns2 + " ,'" + res.PiUsuarioDespacha + "'"
				qryIns2 = qryIns2 + " ," + strconv.Itoa(res.CtaID) + ")"
				qryIns2 = qryIns2 + ";"
				/*ctx = context.Background()
				resins, err := db.QueryContext(ctx, qry)
				if err != nil {
					//defer db.Close()
					log.Println("ERROR INSERT INTO clin_far_movim_devol (recepciondevolucionpaciente) qry: ", qry)
					log.Println(err, resins)
					http.Error(w, err.Error(), 500)
				}
				defer resins.Close()*/

				VMeInID, VCodMei, VBodOrigen, _, err := DatosMovimiento(res.PiServidor, det[i].PiIDMovimientoDet)
				if err != nil {
					logger.Error(logs.InformacionLog{
						Mensaje: "Se cayo buscar datos movimiento",
						Error:   err,
					})
					http.Error(w, err.Error(), http.StatusInternalServerError)
					return
				}

				//Actualiza stock BODEGAS_INV
				qryIns2 = qryIns2 + " UPDATE CLIN_FAR_BODEGAS_INV "
				qryIns2 = qryIns2 + " SET FBOI_STOCK_ACTUAL  = (nvl(FBOI_STOCK_ACTUAL ,0) + " + strconv.Itoa(det[i].PiCantidadAdevolver) + ")"
				qryIns2 = qryIns2 + " WHERE FBOI_FBOD_CODIGO  = " + strconv.Itoa(VBodOrigen)
				qryIns2 = qryIns2 + " AND FBOI_MEIN_ID  = " + strconv.Itoa(VMeInID)
				qryIns2 = qryIns2 + ";"

				DescripcionMov, err := BuscaTipoMovim(60, res.PiServidor)
				if err != nil {
					logger.Error(logs.InformacionLog{
						Mensaje: "Se cayo busca tipo movimiento",
						Error:   err,
					})
					http.Error(w, err.Error(), http.StatusInternalServerError)
					return
				}

				// Registra en Kardex
				qryIns3 = qryIns3 + " insert into CLIN_FAR_KARDEX (KARD_ID, KARD_MEIN_ID, KARD_MEIN_CODMEI, KARD_FECHA, KARD_CANTIDAD, KARD_OPERACION, KARD_BOD_ORIGEN, KARD_BOD_DESTINO, KARD_MFDE_ID, KARD_MDEV_ID, KARD_DESCRIPCION) values ( CLIN_KARD_SEQ.NEXTVAL, "
				qryIns3 = qryIns3 + strconv.Itoa(VMeInID)
				qryIns3 = qryIns3 + ", '" + VCodMei + "'"
				qryIns3 = qryIns3 + ", sysdate"
				qryIns3 = qryIns3 + ", " + strconv.Itoa(det[i].PiCantidadAdevolver)
				qryIns3 = qryIns3 + ", 'S'"
				qryIns3 = qryIns3 + ", null"
				qryIns3 = qryIns3 + ", " + strconv.Itoa(VBodOrigen)
				qryIns3 = qryIns3 + ", " + strconv.Itoa(det[i].PiIDMovimientoDet)
				qryIns3 = qryIns3 + ", " + strconv.Itoa(VMDevID)
				qryIns3 = qryIns3 + ", '" + DescripcionMov + "' )"
				qryIns3 = qryIns3 + ";"
				/*ctx = context.Background()
				resinskardex, err := db.QueryContext(ctx, qry)
				if err != nil {
					//defer db.Close()
					log.Println("ERROR insert CLIN_FAR_KARDEX (recepciondevolucionpaciente) query: ", qry)
					log.Println(err, resinskardex)
				}
				defer resinskardex.Close()*/

				query = query + qryUpd1 + qryIns1 + qryIns2 + qryIns3
			}
		}
		//-------------------------------------------------------------------------
		if transaccion == 1 {
			query = "BEGIN " + query + " END;"
			ctx := context.Background()
			rowsT, err := db.QueryContext(ctx, query)

			logger.Trace(logs.InformacionLog{
				Query:   query,
				Mensaje: "Query transaccion recepcion devolucion paciente",
			})

			if err != nil {
				logger.Error(logs.InformacionLog{
					Query:   query,
					Mensaje: "Se cayo query transaccion recepcion devolucion paciente",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			defer rowsT.Close()
		}
		//-------------------------------------------------------------------------

		// Evento Sol
		qry = "insert into CLIN_FAR_EVENTOSOLICITUD ( SOLI_ID, CODEVENTO, FECHA, OBSERVACION, USUARIO) values ("
		qry = qry + strconv.Itoa(det[i].PiSoliID)
		qry = qry + "," + strconv.Itoa(78)
		qry = qry + ", sysdate"
		qry = qry + "," + "'Agrega devolucion paciente'"
		qry = qry + ",'" + res.PiUsuarioDespacha + "' )"
		ctx := context.Background()
		rows, err := db.QueryContext(ctx, qry)

		logger.Trace(logs.InformacionLog{
			Query:   qry,
			Mensaje: "Query crea evento solicitud",
		})

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   qry,
				Mensaje: "Se cayo query crea evento solicitud",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()
	}

	//defer db.Close()

	models.EnableCors(&w)
	var valores models.RespuestaGrabacion
	valores.Respuesta = "OK"
	var retornoValores models.RespuestaGrabacion = valores
	json.NewEncoder(w).Encode(retornoValores)
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
