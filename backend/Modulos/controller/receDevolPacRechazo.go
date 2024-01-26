package controller

import (
	"context"
	"encoding/json"
	ioutil "io"
	"net/http"
	"strconv"
	"strings"

	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"

	paramg "sonda.com/logistico/Modulos/comun"
	"sonda.com/logistico/Modulos/models"
)

// ReceDevolPacRechazo is...
func ReceDevolPacRechazo(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ParamDevolPacRechazo
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
	res := models.ParamDevolPacRechazo{}
	json.Unmarshal([]byte(output), &res)

	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	var i int
	var qry string
	var VMDevID int
	var IDMDevRec int
	var soliID int
	var flg bool = false

	models.EnableCors(&w)
	det := res.Detalle

	db, _ := database.GetConnection(res.PiServidor)
	//if err != nil {
	//	log.Println("ERROR (recepciondevolucionpaciente): conectarBaseDeDatos, res.PiServidor: ", res.PiServidor)
	//	http.Error(w, err.Error(), 500)
	//}

	//-------------------------------------------------------------------------
	qryUpd1 := ""
	qryUpd2 := ""
	qryIns1 := ""
	qryIns2 := ""
	qryIns3 := ""
	transaccion := 0
	query := ""
	VMDevID = 0
	IDMDevRec = 0
	tipoMov := 0
	op := 0

	if res.CodAmbito == 1 {
		tipoMov = 150
	}

	if res.CodAmbito == 2 {
		tipoMov = 160
	}

	if res.CodAmbito == 3 {
		tipoMov = 140
	}

	if res.CodAmbito == 1 {
		op = 61
	}

	if res.CodAmbito == 2 {
		op = 62
	}

	if res.CodAmbito == 3 {
		op = 63
	}
	//-------------------------------------------------------------------------
	IDAgrupadorMovDev := GeneraSecidAgrupadorMovDev(res.PiServidor)

	// DETALLE  SOLICITUD
	for i := range det {

		if (det[i].PiCantidadAdevolver > 0 && det[i].PiCantidadAdevolver <= det[i].PiCantDispensada) ||
			(det[i].PiCantidadARechazar > 0 && det[i].PiCantidadARechazar <= det[i].PiCantDispensada) {
			qryUpd1 = ""
			qryUpd2 = ""
			qryIns1 = ""
			qryIns2 = ""
			qryIns3 = ""

			transaccion = 1

			if det[i].PiCantidadAdevolver > 0 || det[i].PiCantidadARechazar > 0 {
				qryUpd1 = qryUpd1 + " update clin_far_solicitudes_det"
				qryUpd1 = qryUpd1 + " set "
				qryUpd1 = qryUpd1 + "  sode_cant_devo = (nvl(sode_cant_devo, 0) + " + strconv.Itoa(det[i].PiCantidadAdevolver) + "+" + strconv.Itoa(det[i].PiCantidadARechazar) + ")"
				qryUpd1 = qryUpd1 + " ,SODE_CANT_A_DEV = 0 "
				qryUpd1 = qryUpd1 + " ,Sode_Estado = 78"
				qryUpd1 = qryUpd1 + " ,Sode_Observaciones = 'Actualiza recepcion devolucion paciente'"
				if det[i].PiCantidadARechazar > 0 {
					qryUpd1 = qryUpd1 + " ,SODE_CANT_RECHAZO = " + strconv.Itoa(det[i].PiCantidadARechazar)
				}
				qryUpd1 = qryUpd1 + " Where sode_id = " + strconv.Itoa(det[i].PiSodeID)
				qryUpd1 = qryUpd1 + " And sode_soli_id = " + strconv.Itoa(det[i].PiSoliID)
				qryUpd1 = qryUpd1 + ";"
			}

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
			qryIns1 = qryIns1 + ", to_date('" + det[i].PiFechaVto + "','YYYY-MM-DD'))"
			qryIns1 = qryIns1 + ";"

			if det[i].PiCantidadAdevolver > 0 || det[i].PiCantidadARechazar > 0 {
				cantADevolver := det[i].PiCantidadAdevolver + det[i].PiCantidadARechazar
				var (
					cantidad  int
					mfdeIDAux int
				)

				queryAux := " select MFDE_ID, MFDE_CANTIDAD from clin_far_movimdet  "
				queryAux = queryAux + " where mfde_movf_id = ( select movf_id from clin_far_movim where movf_soli_id = " + strconv.Itoa(det[i].PiSoliID) + ") "
				queryAux = queryAux + " and mfde_tipo_mov = " + strconv.Itoa(tipoMov) + " and MFDE_MEIN_CODMEI = '" + det[i].PiCodMei + "' "
				queryAux = queryAux + " and (MFDE_LOTE = '" + det[i].PiLote + "' or MFDE_LOTE is null)"
				ctxAux := context.Background()
				rowsAux, errAux := db.QueryContext(ctxAux, queryAux)

				logger.Trace(logs.InformacionLog{
					Query:   queryAux,
					Mensaje: "Query obtener producto de detalle movimiento",
				})

				if err != nil {
					logger.Error(logs.InformacionLog{
						Query:   queryAux,
						Mensaje: "Se cayo query obtener producto de detalle movimiento",
						Error:   errAux,
					})
					http.Error(w, errAux.Error(), http.StatusInternalServerError)
					return
				}
				defer rowsAux.Close()

				for rowsAux.Next() {
					errAux := rowsAux.Scan(&mfdeIDAux, &cantidad)
					if errAux != nil {
						logger.Error(logs.InformacionLog{
							Mensaje: "Se cayo scan obtener producto de detalle movimiento",
							Error:   errAux,
						})
						http.Error(w, errAux.Error(), http.StatusInternalServerError)
						return
					}
					NuevoIDMDev := GeneraNuevoIDMDev(res.PiServidor)
					VMDevID = NuevoIDMDev
					if cantADevolver > 0 {
						if cantidad == cantADevolver {
							qryIns2 = qryIns2 + "INSERT INTO clin_far_movim_devol (MDEV_ID, mdev_mfde_id, mdev_movf_tipo, mdev_fecha, mdev_cantidad"
							qryIns2 = qryIns2 + ", mdev_responsable, mdev_ctas_id, MDEV_SOLI_ID,INT_ERP_ESTADO, MDEV_AGRUPADOR_ID) values ( "
							qryIns2 = qryIns2 + strconv.Itoa(VMDevID)
							qryIns2 = qryIns2 + " , " + strconv.Itoa(mfdeIDAux)
							qryIns2 = qryIns2 + " ," + strconv.Itoa(op)
							qryIns2 = qryIns2 + " ,sysdate"
							qryIns2 = qryIns2 + " ," + strconv.Itoa(cantADevolver)
							qryIns2 = qryIns2 + " ,'" + res.PiUsuarioDespacha + "'"
							qryIns2 = qryIns2 + " ," + strconv.Itoa(res.CtaID)
							qryIns2 = qryIns2 + ", " + strconv.Itoa(det[i].PiSoliID)
							qryIns2 = qryIns2 + " ,'PENDIENTE'"
							qryIns2 = qryIns2 + " ," + strconv.Itoa(IDAgrupadorMovDev)
							qryIns2 = qryIns2 + " );"
							cantADevolver = cantADevolver - cantidad
						} else {
							if cantidad > cantADevolver {
								qryIns2 = qryIns2 + "INSERT INTO clin_far_movim_devol (MDEV_ID, mdev_mfde_id, mdev_movf_tipo, mdev_fecha, mdev_cantidad"
								qryIns2 = qryIns2 + ", mdev_responsable, mdev_ctas_id, MDEV_SOLI_ID,INT_ERP_ESTADO, MDEV_AGRUPADOR_ID) values ( "
								qryIns2 = qryIns2 + strconv.Itoa(VMDevID)
								qryIns2 = qryIns2 + " , " + strconv.Itoa(mfdeIDAux)
								qryIns2 = qryIns2 + " ," + strconv.Itoa(op)
								qryIns2 = qryIns2 + " ,sysdate"
								qryIns2 = qryIns2 + " ," + strconv.Itoa(cantADevolver)
								qryIns2 = qryIns2 + " ,'" + res.PiUsuarioDespacha + "'"
								qryIns2 = qryIns2 + " ," + strconv.Itoa(res.CtaID)
								qryIns2 = qryIns2 + ", " + strconv.Itoa(det[i].PiSoliID)
								qryIns2 = qryIns2 + " ,'PENDIENTE'"
								qryIns2 = qryIns2 + " ," + strconv.Itoa(IDAgrupadorMovDev)
								qryIns2 = qryIns2 + " );"
								cantADevolver = cantADevolver - cantidad
							}
						}
					}
				}
			}
			if det[i].PiCantidadARechazar > 0 {
				flg = true
				NuevoIDMDev := GeneraNuevoIDMDev(res.PiServidor)
				IDMDevRec = NuevoIDMDev
				qryIns2 = qryIns2 + "INSERT INTO clin_far_movim_devol (MDEV_ID, mdev_mfde_id, mdev_movf_tipo, mdev_fecha, mdev_cantidad"
				qryIns2 = qryIns2 + ", mdev_responsable, mdev_ctas_id, MDEV_SOLI_ID,INT_ERP_ESTADO, MDEV_AGRUPADOR_ID) values ( "
				qryIns2 = qryIns2 + strconv.Itoa(IDMDevRec)
				qryIns2 = qryIns2 + " , (select MFDE_ID from clin_far_movimdet where mfde_movf_id = ( select movf_id from clin_far_movim where movf_soli_id = " + strconv.Itoa(det[i].PiSoliID) + ") and mfde_tipo_mov = " + strconv.Itoa(tipoMov) + " and MFDE_MEIN_CODMEI = '" + det[i].PiCodMei + "')"
				qryIns2 = qryIns2 + " ,201"
				qryIns2 = qryIns2 + " ,sysdate + 0.00001"
				qryIns2 = qryIns2 + " ," + strconv.Itoa(det[i].PiCantidadARechazar)
				qryIns2 = qryIns2 + " ,'" + res.PiUsuarioDespacha + "'"
				qryIns2 = qryIns2 + " ," + strconv.Itoa(res.CtaID)
				qryIns2 = qryIns2 + ", " + strconv.Itoa(det[i].PiSoliID)
				qryIns2 = qryIns2 + " ,'PENDIENTE'"
				qryIns2 = qryIns2 + " ," + strconv.Itoa(IDAgrupadorMovDev)
				qryIns2 = qryIns2 + " );"
			}

			//Actualiza stock BODEGAS_INV
			qryUpd2 = qryUpd2 + " UPDATE CLIN_FAR_BODEGAS_INV "
			qryUpd2 = qryUpd2 + " SET FBOI_STOCK_ACTUAL  = (nvl(FBOI_STOCK_ACTUAL ,0) + " + strconv.Itoa(det[i].PiCantidadAdevolver) + ")"
			qryUpd2 = qryUpd2 + " WHERE FBOI_FBOD_CODIGO  = (select MOVF_BOD_DESTINO from clin_far_movim where movf_soli_id = " + strconv.Itoa(det[i].PiSoliID) + ")"
			qryUpd2 = qryUpd2 + " AND FBOI_MEIN_ID  = (select mein_id from clin_far_mamein where mein_codmei = '" + det[i].PiCodMei + "')"
			qryUpd2 = qryUpd2 + ";"

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
			qryIns3 = qryIns3 + " INSERT into CLIN_FAR_KARDEX (KARD_ID, KARD_MEIN_ID, KARD_MEIN_CODMEI, KARD_FECHA, KARD_CANTIDAD, KARD_OPERACION, KARD_BOD_ORIGEN, KARD_BOD_DESTINO, KARD_MFDE_ID, KARD_MDEV_ID, KARD_DESCRIPCION) values ( CLIN_KARD_SEQ.NEXTVAL, "
			qryIns3 = qryIns3 + " (select mein_id from clin_far_mamein where mein_codmei = '" + det[i].PiCodMei + "')"
			qryIns3 = qryIns3 + ", '" + det[i].PiCodMei + "'"
			qryIns3 = qryIns3 + ", sysdate"
			qryIns3 = qryIns3 + ", " + strconv.Itoa(det[i].PiCantidadAdevolver)
			qryIns3 = qryIns3 + ", 'S'"
			qryIns3 = qryIns3 + ", null"
			qryIns3 = qryIns3 + ", (select MOVF_BOD_DESTINO from clin_far_movim where movf_soli_id = " + strconv.Itoa(det[i].PiSoliID) + ")"
			qryIns3 = qryIns3 + ", " + strconv.Itoa(det[i].PiIDMovimientoDet)
			qryIns3 = qryIns3 + ", " + strconv.Itoa(VMDevID)
			qryIns3 = qryIns3 + ", '" + DescripcionMov + "' )"
			qryIns3 = qryIns3 + ";"
		}
		query = query + qryUpd1 + qryIns1 + qryIns2 + qryUpd2 + qryIns3
	}
	//-------------------------------------------------------------------------
	if transaccion == 1 {
		query = "BEGIN " + query + " END;"
		ctx := context.Background()
		rowsT, err := db.QueryContext(ctx, query)

		logger.Trace(logs.InformacionLog{
			Query:   query,
			Mensaje: "Query transaccion recepcion devolucion paciente rechazo",
		})

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   query,
				Mensaje: "Se cayo query transaccion recepcion devolucion paciente rechazo",
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
		Mensaje: "Query crear evento solicitud",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   qry,
			Mensaje: "Se cayo query crear evento solicitud",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	soliID = det[i].PiSoliID
	defer rows.Close()

	// defer db.Close()

	// Input data.
	FOLIO := 0
	SobreGiro := false

	var param models.ParamFin700Movimiento
	param.HdgCodigo = res.PiHDGCodigo
	param.TipoMovimiento = op
	param.IDAgrupador = 0
	param.NumeroMovimiento = 0
	param.SoliID = soliID
	param.Servidor = res.PiServidor
	param.Usuario = res.PiUsuarioDespacha
	param.SobreGiro = SobreGiro
	param.IntegraFin700, _ = paramg.ObtenerClinFarParamGeneral(db, "intFin700")
	param.DB = db
	if param.IntegraFin700 == "SI" {
		FOLIO = EnviarmovimientosFin702(param)
		logger.Trace(logs.InformacionLog{
			Mensaje:  "Envio exitoso FIN 702",
			Contexto: map[string]interface{}{"folio": FOLIO},
		})
		if flg {
			param.TipoMovimiento = 201
			FOLIO = EnviarmovimientosFin702(param)
			logger.Trace(logs.InformacionLog{Mensaje: "FOLIO : " + strconv.Itoa(FOLIO)})
		}
	}

	logger.Info(logs.InformacionLog{Mensaje: "FOLIO : " + strconv.Itoa(FOLIO)})

	models.EnableCors(&w)
	var valores models.RespuestaGrabacion
	valores.Respuesta = "OK"

	var retornoValores models.RespuestaGrabacion = valores
	json.NewEncoder(w).Encode(retornoValores)
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
