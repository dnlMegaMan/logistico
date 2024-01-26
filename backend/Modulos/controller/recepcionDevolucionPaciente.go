package controller

import (
	"context"
	"encoding/json"
	ioutil "io"
	"net/http"
	"strconv"
	"strings"

	paramg "sonda.com/logistico/Modulos/comun"
	"sonda.com/logistico/Modulos/models"
	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"
)

// RecepcionDevolucionPaciente is...
func RecepcionDevolucionPaciente(w http.ResponseWriter, r *http.Request) {
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
	var VMDevID int
	var soliID int

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
	//-------------------------------------------------------------------------
	IDAgrupadorMovDev := GeneraSecidAgrupadorMovDev(res.PiServidor)

	// DETALLE  SOLICITUD
	for i := range det {

		if det[i].PiCantidadAdevolver > 0 && det[i].PiCantidadAdevolver <= det[i].PiCantDispensada {
			qryUpd1 = ""
			qryUpd2 = ""
			qryIns1 = ""
			qryIns2 = ""
			qryIns3 = ""
			transaccion = 1

			qryUpd1 = qryUpd1 + " update clin_far_solicitudes_det"
			qryUpd1 = qryUpd1 + " set sode_cant_devo = (nvl(sode_cant_devo,0) + " + strconv.Itoa(det[i].PiCantidadAdevolver) + ")"
			qryUpd1 = qryUpd1 + " ,Sode_Estado = 78"
			qryUpd1 = qryUpd1 + " ,Sode_Observaciones = 'Actualiza recepcion devolucion paciente'"
			qryUpd1 = qryUpd1 + " Where sode_id = " + strconv.Itoa(det[i].PiSodeID)
			qryUpd1 = qryUpd1 + " And sode_soli_id = " + strconv.Itoa(det[i].PiSoliID)
			qryUpd1 = qryUpd1 + ";"

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

			NuevoIDMDev := GeneraNuevoIDMDev(res.PiServidor)
			VMDevID = NuevoIDMDev

			qryIns2 = qryIns2 + "INSERT INTO clin_far_movim_devol (MDEV_ID, mdev_mfde_id, mdev_movf_tipo, mdev_fecha, mdev_cantidad"
			qryIns2 = qryIns2 + ", mdev_responsable, mdev_ctas_id, MDEV_SOLI_ID,INT_ERP_ESTADO, MDEV_AGRUPADOR_ID) values ( "
			qryIns2 = qryIns2 + strconv.Itoa(VMDevID)
			qryIns2 = qryIns2 + " ," + strconv.Itoa(det[i].PiIDMovimientoDet)
			qryIns2 = qryIns2 + " ,60"
			qryIns2 = qryIns2 + " ,sysdate"
			qryIns2 = qryIns2 + " ," + strconv.Itoa(det[i].PiCantidadAdevolver)
			qryIns2 = qryIns2 + " ,'" + res.PiUsuarioDespacha + "'"
			qryIns2 = qryIns2 + " ," + strconv.Itoa(res.CtaID)
			qryIns2 = qryIns2 + ", " + strconv.Itoa(det[i].PiSoliID)
			qryIns2 = qryIns2 + " ,'PENDIENTE'"
			qryIns2 = qryIns2 + " ," + strconv.Itoa(IDAgrupadorMovDev)
			qryIns2 = qryIns2 + " );"

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
			qryUpd2 = qryUpd2 + " UPDATE CLIN_FAR_BODEGAS_INV "
			qryUpd2 = qryUpd2 + " SET FBOI_STOCK_ACTUAL  = (nvl(FBOI_STOCK_ACTUAL ,0) + " + strconv.Itoa(det[i].PiCantidadAdevolver) + ")"
			qryUpd2 = qryUpd2 + " WHERE FBOI_FBOD_CODIGO  = " + strconv.Itoa(VBodOrigen)
			qryUpd2 = qryUpd2 + " AND FBOI_MEIN_ID  = " + strconv.Itoa(VMeInID)
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

			query = query + qryUpd1 + qryIns1 + qryIns2 + qryUpd2 + qryIns3
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
	soliID = det[i].PiSoliID
	defer rows.Close()

	//defer db.Close()
	// Input data.
	FOLIO := 0
	SobreGiro := false

	var param models.ParamFin700Movimiento
	param.HdgCodigo = res.PiHDGCodigo
	param.TipoMovimiento = 60
	param.IDAgrupador = IDAgrupadorMovDev
	param.NumeroMovimiento = VMDevID
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
