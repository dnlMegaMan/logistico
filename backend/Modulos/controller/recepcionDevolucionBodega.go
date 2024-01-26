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

	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"

	"sonda.com/logistico/Modulos/comun"
	paramg "sonda.com/logistico/Modulos/comun"
	"sonda.com/logistico/Modulos/models"
)

// RecepcionDevolucionBodega is...
func RecepcionDevolucionBodega(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ParamRecepDevolBodega

	//ParamDetRecepDevolBodega

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
	res := models.ParamRecepDevolBodega{}
	json.Unmarshal([]byte(output), &res)

	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	var RecepcionadaTotal string // '0'=No, '1'= Si
	var query string
	var VMfdeID int

	models.EnableCors(&w)
	det := res.Detalle

	// genero secuencia de agrupador para referencia contable
	IDAgrupador, err := GeneraSecidAgrupador(res.PiServidor)
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "Fallo GeneraSecidAgrupador",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	db, _ := database.GetConnection(res.PiServidor)
	valor, err := comun.ObtenerClinFarParamGeneral(db, "usaPCKRecDevBod")
	if err != nil {
		http.Error(w, "Error interno del servidor", http.StatusInternalServerError)
		logger.Error(logs.InformacionLog{
			Mensaje: "Error al obtener el valor del parámetro",
			Error:   err,
		})
		return
	}

	if valor == "SI" {
		logger.Trace(logs.InformacionLog{Mensaje: "Entro en la solución recepcion devolucion bodega"})

		jsonEntrada, _ := json.Marshal(res)
		SRV_MESSAGE := "100000"
		In_Json := string(jsonEntrada)

		logger.Trace(logs.InformacionLog{JSONEntrada: string(jsonEntrada), Mensaje: "JSON de entrada"})

		transaccion, err := db.Begin()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "No puede crear transacción para devolver recepcion devolucion bodega",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		QUERY := "BEGIN PKG_RECEPCION_DEVOLUCION_BODEGA.P_RECEPCION_DEVOLUCION_BODEGA(:1,:2,:3); END;"
		_, err = transaccion.Exec(QUERY,
			PlSQLArrays,
			sql.Out{Dest: &SRV_MESSAGE}, // :1
			In_Json,                     // :2
			IDAgrupador,                 //:3
		)

		if err != nil {

			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo package recepcion devolucion bodega",
				Error:   err,
			})

			SRV_MESSAGE = "Error : " + err.Error()

			err = transaccion.Rollback()

			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo rollback recepcion devolucion bodega",
					Error:   err,
				})
				SRV_MESSAGE = "Error : " + err.Error()
			}
		}

		if SRV_MESSAGE != "1000000" {
			defer transaccion.Rollback()
			logger.Trace(logs.InformacionLog{
				Mensaje: "Rollback de grabar recepcion devolucion bodega " + SRV_MESSAGE,
				Error:   err,
			})
			http.Error(w, SRV_MESSAGE, http.StatusInternalServerError)
			return
		}

	} else {
		qryUpd1 := " "
		qryUpd2 := " "
		qryIns1 := " "
		qryIns2 := " "
		qryIns3 := " "
		transaccion := 0
		//-------------------------------------------------------------------------

		VBodOrigen := res.SOLIBODORIGEN
		VBodDestino := res.SOLIBODDESTINO

		// DETALLE  SOLICITUD
		for i := range det {
			qryUpd1 = " "
			qryUpd2 = " "
			qryIns1 = " "
			qryIns2 = " "
			qryIns3 = " "
			transaccion = 1

			qryUpd1 = qryUpd1 + " update clin_far_solicitudes_det"
			qryUpd1 = qryUpd1 + " set SODE_CANT_DESP = (nvl(SODE_CANT_DESP,0) - " + strconv.Itoa(det[i].PiCantDevolARecepcionar) + "),"
			//qryUpd1 = qryUpd1 + " SODE_CANT_RECEPCIONADO = (nvl(SODE_CANT_RECEPCIONADO,0) - " + strconv.Itoa(det[i].PiCantDevolARecepcionar) + ")"
			qryUpd1 = qryUpd1 + " SODE_CANT_RECEPDEVO = (nvl(SODE_CANT_RECEPDEVO,0) + " + strconv.Itoa(det[i].PiCantDevolARecepcionar) + ")"
			qryUpd1 = qryUpd1 + " where  sode_id =" + strconv.Itoa(det[i].PiSodeID)
			qryUpd1 = qryUpd1 + " And sode_soli_id = " + strconv.Itoa(res.PiSoliID)
			qryUpd1 = qryUpd1 + ";"

			// Evento Det Sol
			qryIns1 = qryIns1 + " insert into CLIN_FAR_DETEVENTOSOLICITUD (SODE_ID, SOLI_ID, CODEVENTO, FECHA, OBSERVACION, CANTIDAD, USUARIO, LOTE, FECHAVTO, HDGCODIGO, ESACODIGO, CMECODIGO) values ("
			qryIns1 = qryIns1 + strconv.Itoa(det[i].PiSodeID)
			qryIns1 = qryIns1 + " ," + strconv.Itoa(res.PiSoliID)
			qryIns1 = qryIns1 + " ," + strconv.Itoa(75)
			qryIns1 = qryIns1 + " , sysdate"
			qryIns1 = qryIns1 + " ," + "'Actualiza detalle solicitud recepcion devolucion bodega'"
			qryIns1 = qryIns1 + " ," + strconv.Itoa(det[i].PiCantDevolARecepcionar)
			qryIns1 = qryIns1 + " ,'" + res.PiUsuarioDespacha + "'"
			qryIns1 = qryIns1 + " ,'" + det[i].PiLote + "'"
			qryIns1 = qryIns1 + " ,to_date('" + det[i].PiFechaVto + "','YYYY-MM-DD') "
			qryIns1 = qryIns1 + " ," + strconv.Itoa(res.PiHDGCodigo)
			qryIns1 = qryIns1 + " ," + strconv.Itoa(res.PiESACodigo)
			qryIns1 = qryIns1 + " ," + strconv.Itoa(res.PiCMECodigo)
			qryIns1 = qryIns1 + ");"

			NuevoIDMFDe := GeneraNuevoidMFDEid(res.PiServidor)
			VMfdeID = NuevoIDMFDe

			qryIns2 = qryIns2 + " insert into clin_far_movimdet (mfde_id, mfde_movf_id, mfde_fecha, mfde_tipo_mov, mfde_mein_codmei, mfde_mein_id"
			qryIns2 = qryIns2 + ", mfde_cantidad, mfde_valor_costo_unitario, mfde_valor_venta_unitario, mfde_unidad_compra, mfde_unidad_despacho"
			qryIns2 = qryIns2 + ", mfde_ctas_id, mfde_incob_fonasa, mfde_lote, mfde_lote_fechavto, MFDE_SOLI_ID, MFDE_MDEV_ID, MFDE_AGRUPADOR_ID,INT_ERP_ESTADO, HDGCODIGO, ESACODIGO, CMECODIGO) values ( "
			qryIns2 = qryIns2 + strconv.Itoa(VMfdeID)
			qryIns2 = qryIns2 + ", " + strconv.Itoa(det[i].PiMovfID)
			qryIns2 = qryIns2 + ", sysdate"
			qryIns2 = qryIns2 + ", " + strconv.Itoa(50)
			qryIns2 = qryIns2 + ", '" + det[i].PiCodMei + "'"
			qryIns2 = qryIns2 + ", " + strconv.Itoa(det[i].PiMeInID)
			qryIns2 = qryIns2 + ", " + strconv.Itoa(det[i].PiCantDevolARecepcionar)
			qryIns2 = qryIns2 + ", " + strconv.FormatFloat(0, 'g', 1, 64)
			qryIns2 = qryIns2 + ", " + strconv.Itoa(0)
			qryIns2 = qryIns2 + ", " + strconv.Itoa(0)
			qryIns2 = qryIns2 + ", " + strconv.Itoa(0)
			qryIns2 = qryIns2 + ", " + strconv.Itoa(0)
			qryIns2 = qryIns2 + ", ''"
			qryIns2 = qryIns2 + ", '" + det[i].PiLote + "'"
			qryIns2 = qryIns2 + ", to_date('" + det[i].PiFechaVto + "','YYYY-MM-DD') "
			qryIns2 = qryIns2 + ", " + strconv.Itoa(res.PiSoliID)
			qryIns2 = qryIns2 + ", " + strconv.Itoa(det[i].PiMDevID)
			qryIns2 = qryIns2 + ", " + strconv.Itoa(IDAgrupador)
			qryIns2 = qryIns2 + ", 'PENDIENTE'"
			qryIns2 = qryIns2 + " ," + strconv.Itoa(res.PiHDGCodigo)
			qryIns2 = qryIns2 + " ," + strconv.Itoa(res.PiESACodigo)
			qryIns2 = qryIns2 + " ," + strconv.Itoa(res.PiCMECodigo)
			qryIns2 = qryIns2 + " );"

			DescripcionMov, err := BuscaTipoMovim(50, res.PiServidor)
			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo busca tipo movimiento",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			//VMeInID, VCodMei, VBodOrigen, VBodDestino := datosmovimiento(res.PiServidor, det[i].PiMfDeId)
			VMeInID := det[i].PiMeInID
			VCodMei := det[i].PiCodMei

			//Actualiza stock BODEGAS_INV
			qryUpd2 = qryUpd2 + " UPDATE CLIN_FAR_BODEGAS_INV "
			qryUpd2 = qryUpd2 + " SET FBOI_STOCK_ACTUAL  = (nvl(FBOI_STOCK_ACTUAL ,0) + " + strconv.Itoa(det[i].PiCantDevolARecepcionar) + ")"
			qryUpd2 = qryUpd2 + " WHERE FBOI_FBOD_CODIGO  = " + strconv.Itoa(VBodDestino)
			qryUpd2 = qryUpd2 + " AND FBOI_MEIN_ID  = " + strconv.Itoa(VMeInID)
			qryUpd2 = qryUpd2 + ";"

			// Registra en Kardex
			qryIns3 = qryIns3 + " insert into CLIN_FAR_KARDEX (KARD_ID, KARD_MEIN_ID, KARD_MEIN_CODMEI, KARD_FECHA, KARD_CANTIDAD"
			qryIns3 = qryIns3 + ", KARD_OPERACION, KARD_BOD_ORIGEN, KARD_BOD_DESTINO, KARD_MFDE_ID, KARD_MDEV_ID, KARD_DESCRIPCION, HDGCODIGO, ESACODIGO, CMECODIGO)"
			qryIns3 = qryIns3 + " values ( CLIN_KARD_SEQ.NEXTVAL "
			qryIns3 = qryIns3 + ", " + strconv.Itoa(VMeInID)
			qryIns3 = qryIns3 + ", '" + VCodMei + "'"
			qryIns3 = qryIns3 + ", sysdate"
			qryIns3 = qryIns3 + ", " + strconv.Itoa(det[i].PiCantDevolARecepcionar)
			qryIns3 = qryIns3 + ", 'S'"
			qryIns3 = qryIns3 + ", " + strconv.Itoa(VBodDestino)
			qryIns3 = qryIns3 + ", " + strconv.Itoa(VBodOrigen)
			qryIns3 = qryIns3 + ", " + strconv.Itoa(VMfdeID)
			qryIns3 = qryIns3 + ", " + strconv.Itoa(det[i].PiMDevID)
			qryIns3 = qryIns3 + ", '" + DescripcionMov + "' "
			qryIns3 = qryIns3 + " ," + strconv.Itoa(res.PiHDGCodigo)
			qryIns3 = qryIns3 + " ," + strconv.Itoa(res.PiESACodigo)
			qryIns3 = qryIns3 + " ," + strconv.Itoa(res.PiCMECodigo)
			qryIns3 = qryIns3 + ");"

			query = query + qryUpd1 + qryIns1 + qryIns2 + qryUpd2 + qryIns3
		}

		//-------------------------------------------------------------------------
		if transaccion == 1 {
			query = "BEGIN " + query + " END;"
			ctx := context.Background()
			rowsT, err := db.QueryContext(ctx, query)

			logger.Trace(logs.InformacionLog{
				Query:   query,
				Mensaje: "Query transaccion recepcion devolucion bodega",
			})

			if err != nil {
				logger.Error(logs.InformacionLog{
					Query:   query,
					Mensaje: "Se cayo query transaccion recepcion devolucion bodega",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			defer rowsT.Close()
		}
		//-------------------------------------------------------------------------

		// CABECERA SOLICITUD
		query = "select sum(recpecion_parcial) "
		query = query + " from ( SELECT SODE_CANT_SOLI,sode_cant_recepcionado  ,(case when SODE_CANT_SOLI > SODE_CANT_DESP then 1  else 0 end ) recpecion_parcial "
		query = query + " from clin_far_solicitudes_det where sode_soli_id =" + strconv.Itoa(res.PiSoliID)
		query = query + " and SODE_ESTADO <> 110 )"
		ctx := context.Background()
		rowstipodespacho, err := db.QueryContext(ctx, query)

		logger.Trace(logs.InformacionLog{
			Query:   query,
			Mensaje: "Query obtener recepcion parcial",
		})

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   query,
				Mensaje: "Se cayo query obtener recepcion parcial",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		var strVal1 string
		var ind int
		ind = 0
		for rowstipodespacho.Next() {
			err := rowstipodespacho.Scan(&strVal1)
			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo scan obtener recepcion parcial",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			RecepcionadaTotal = strVal1
			ind = ind + 1
		}
		defer rowstipodespacho.Close()

		if RecepcionadaTotal != "0" {
			query = "update clin_far_solicitudes"
			query = query + " set soli_estado = 78"
			query = query + " Where soli_id = " + strconv.Itoa(res.PiSoliID)
			ctx := context.Background()
			resupdsol, err := db.QueryContext(ctx, query)

			logger.Trace(logs.InformacionLog{
				Query:   query,
				Mensaje: "Query actualiza estado solicitud a 78",
			})

			if err != nil {
				logger.Error(logs.InformacionLog{
					Query:   query,
					Mensaje: "Se cayo query actualiza estado solicitud a 78",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			defer resupdsol.Close()

			// Evento Sol
			query = "insert into CLIN_FAR_EVENTOSOLICITUD ( SOLI_ID, CODEVENTO, FECHA, OBSERVACION, USUARIO, HDGCODIGO, ESACODIGO, CMECODIGO) values ("
			query = query + strconv.Itoa(res.PiSoliID)
			query = query + "," + strconv.Itoa(78)
			query = query + ", sysdate"
			query = query + "," + "'Actualiza recepcion solicitud'"
			query = query + ",'" + res.PiUsuarioDespacha + "' "
			query = query + " ," + strconv.Itoa(res.PiHDGCodigo)
			query = query + " ," + strconv.Itoa(res.PiESACodigo)
			query = query + " ," + strconv.Itoa(res.PiCMECodigo)
			query = query + " )"
			ctx = context.Background()
			rows, err := db.QueryContext(ctx, query)

			logger.Trace(logs.InformacionLog{
				Query:   query,
				Mensaje: "Query crea evento solicitud",
			})

			if err != nil {
				logger.Error(logs.InformacionLog{
					Query:   query,
					Mensaje: "Se cayo query crea evento solicitud",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			defer rows.Close()
		}

		if RecepcionadaTotal == "0" {
			query = "update clin_far_solicitudes"
			query = query + " set soli_estado = 75"
			query = query + " Where soli_id = " + strconv.Itoa(res.PiSoliID)
			ctx := context.Background()
			resupdsol, err := db.QueryContext(ctx, query)

			logger.Trace(logs.InformacionLog{
				Query:   query,
				Mensaje: "Query actualiza estado solicitud a 75",
			})

			if err != nil {
				logger.Error(logs.InformacionLog{
					Query:   query,
					Mensaje: "Se cayo query actualiza estado solicitud a 75",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			defer resupdsol.Close()

			query = "insert into CLIN_FAR_EVENTOSOLICITUD ( SOLI_ID, CODEVENTO, FECHA, OBSERVACION, USUARIO, HDGCODIGO, ESACODIGO, CMECODIGO) values ("
			query = query + strconv.Itoa(res.PiSoliID)
			query = query + "," + strconv.Itoa(75)
			query = query + ", sysdate"
			query = query + "," + "'Actualiza recepcion solicitud'"
			query = query + ",'" + res.PiUsuarioDespacha + "' "
			query = query + " ," + strconv.Itoa(res.PiHDGCodigo)
			query = query + " ," + strconv.Itoa(res.PiESACodigo)
			query = query + " ," + strconv.Itoa(res.PiCMECodigo)
			query = query + " )"
			ctx = context.Background()
			rowsI, err := db.QueryContext(ctx, query)

			logger.Trace(logs.InformacionLog{
				Query:   query,
				Mensaje: "Query crea evento solicitud",
			})

			if err != nil {
				logger.Error(logs.InformacionLog{
					Query:   query,
					Mensaje: "Se cayo query crea evento solicitud",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			defer rowsI.Close()
		}
	}

	//defer db.Close()

	// Input data.
	FOLIO := 0
	SobreGiro := false

	var param models.ParamFin700Movimiento
	param.HdgCodigo = res.PiHDGCodigo
	param.TipoMovimiento = 50
	param.IDAgrupador = IDAgrupador
	param.NumeroMovimiento = 0
	param.SoliID = res.PiSoliID
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
	}

	logger.Info(logs.InformacionLog{Mensaje: "FOLIO : " + strconv.Itoa(FOLIO)})

	models.EnableCors(&w)
	var valores models.RespuestaGrabacion
	valores.Respuesta = "FOLIO : " + strconv.Itoa(FOLIO)
	var retornoValores models.RespuestaGrabacion = valores
	json.NewEncoder(w).Encode(retornoValores)
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
