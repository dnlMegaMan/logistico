package controller

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	ioutil "io"
	"net/http"
	"strconv"
	"strings"

	logs "sonda.com/logistico/logging"

	. "github.com/godror/godror"
	database "sonda.com/logistico/pkg_conexion"

	paramg "sonda.com/logistico/Modulos/comun"
	"sonda.com/logistico/Modulos/models"
)

// DevolverAutopedido is...
func DevolverAutopedido(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ParamDevolBodega
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
	res := models.ParamDevolBodega{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.PiUsuarioDespacha)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	var Disponible int
	var i int
	var soliId int
	var qry string
	var VMDevID int

	models.EnableCors(&w)
	det := res.Detalle

	db, _ := database.GetConnection(res.PiServidor)

	//-------------------------------------------------------------------------
	qryUpd1 := " "
	qryUpd2 := " "
	qryIns1 := " "
	qryIns2 := " "
	qryIns3 := " "
	transaccion := 0
	//-------------------------------------------------------------------------

	// genero secuencia de agrupador para referencia contable  mov devol
	IDAgrupadorMovDev := GeneraSecidAgrupadorMovDev(res.PiServidor)

	///buscar valor del FLAG en BD
	valor, err := paramg.ObtenerClinFarParamGeneral(db, "usaPCKDevAut")
	if err != nil {
		http.Error(w, "Error interno del servidor", http.StatusInternalServerError)
		logger.Error(logs.InformacionLog{
			Mensaje: "Error al obtener el valor del parámetro",
			Error:   err,
		})
		return
	}

	// DETALLE  SOLICITUD
	for i := range det {
		Disponible = det[i].PiTotalRecepcionado - det[i].PiCantDevuelta

		if det[i].PiCantidadAdevolver > 0 && det[i].PiCantDevuelta < det[i].PiCantRecepcionada {

			if valor == "SI" {

				var response string
				logger.Info(logs.InformacionLog{Query: "Entro en la solucion [devolverAutopedido.go] por package PKG_DEVOLVER_AUTOPEDIDO.P_DEVOLVER_AUTOPEDIDO", Mensaje: "Entro en la soluci�n DevolverAutopedido [devolverAutopedido.go] por package PKG_DEVOLVER_AUTOPEDIDO.P_DEVOLVER_AUTOPEDIDO"})
				transaccion, err := db.Begin()
				if err != nil {
					logger.Error(logs.InformacionLog{
						Mensaje: "No puede PKG_DEVOLVER_AUTOPEDIDO",
						Error:   err,
					})
					http.Error(w, err.Error(), http.StatusInternalServerError)
					return
				}

				logger.Info(logs.InformacionLog{Mensaje: "Parametros de entrada al Package PKG_DEVOLVER_AUTOPEDIDO"})
				logger.Info(logs.InformacionLog{Mensaje: "IN_DISPONIBLE: " + strconv.Itoa(Disponible)})
				logger.Info(logs.InformacionLog{Mensaje: "IN_PI_CANT_DEVO: " + strconv.Itoa(det[i].PiCantidadAdevolver)})
				logger.Info(logs.InformacionLog{Mensaje: "IN_PI_SODE_ID: " + strconv.Itoa(det[i].PiSodeID)})
				logger.Info(logs.InformacionLog{Mensaje: "IN_PI_SOLI_ID: " + strconv.Itoa(det[i].PiSoliID)})
				logger.Info(logs.InformacionLog{Mensaje: "IN_PI_USU_DESP: " + res.PiUsuarioDespacha})
				logger.Info(logs.InformacionLog{Mensaje: "IN_PI_LOTE: " + det[i].PiLote})
				logger.Info(logs.InformacionLog{Mensaje: "IN_PI_FECHA_VTO: " + det[i].PiFechaVto})
				logger.Info(logs.InformacionLog{Mensaje: "IN_PI_MFDEID: " + strconv.Itoa(det[i].PiMfDeID)})

				qry := "BEGIN PKG_DEVOLVER_AUTOPEDIDO.P_DEVOLVER_AUTOPEDIDO(:1,:2,:3,:4,:5,:6,:7,:8,:9,:10,:11,:12); END;"
				_, err = transaccion.Exec(qry,
					PlSQLArrays,
					Disponible,                 // :1
					det[i].PiCantidadAdevolver, // :2
					det[i].PiSodeID,            // :3
					det[i].PiSoliID,            // :4
					res.PiUsuarioDespacha,      // :5
					det[i].PiLote,              // :6
					det[i].PiFechaVto,          // :7
					det[i].PiMfDeID,            // :8
					res.PiHDGCodigo,            // :9
					res.PiESACodigo,            // :10
					res.PiCMECodigo,            // :11
					sql.Out{Dest: &response})   // :12

				if err != nil {
					logger.Error(logs.InformacionLog{
						Mensaje: "Fallo package PKG_DEVOLVER_AUTOPEDIDO",
						Error:   err,
					})
					err = transaccion.Rollback()
				}

				logger.Info(logs.InformacionLog{Query: qry, Mensaje: "Ejecucion Package PKG_DEVOLVER_AUTOPEDIDO"})

				logger.Info(logs.InformacionLog{Mensaje: response})

			} else {

				qryUpd1 = " "
				qryUpd2 = " "
				qryIns1 = " "
				qryIns2 = " "
				qryIns3 = " "
				transaccion = 1

				if Disponible > det[i].PiCantidadAdevolver {
					qryUpd1 = qryUpd1 + " update clin_far_solicitudes_det"
					qryUpd1 = qryUpd1 + " set sode_cant_devo = (nvl(sode_cant_devo,0) + " + strconv.Itoa(det[i].PiCantidadAdevolver) + ")"
					qryUpd1 = qryUpd1 + " ,Sode_Estado = 40"
					qryUpd1 = qryUpd1 + " ,Sode_Observaciones = 'Actualiza devolucion a bodega'"
					qryUpd1 = qryUpd1 + " Where sode_id = " + strconv.Itoa(det[i].PiSodeID)
					qryUpd1 = qryUpd1 + " And sode_soli_id = " + strconv.Itoa(det[i].PiSoliID)
					qryUpd1 = qryUpd1 + " And HDGCODIGO = " + strconv.Itoa(res.PiHDGCodigo)
					qryUpd1 = qryUpd1 + " And ESACODIGO = " + strconv.Itoa(res.PiESACodigo)
					qryUpd1 = qryUpd1 + " And CMECODIGO = " + strconv.Itoa(res.PiCMECodigo)
					qryUpd1 = qryUpd1 + ";"
				}

				if Disponible == det[i].PiCantidadAdevolver {
					qryUpd1 = qryUpd1 + " update clin_far_solicitudes_det"
					qryUpd1 = qryUpd1 + " set sode_cant_devo = (nvl(sode_cant_devo,0) + " + strconv.Itoa(det[i].PiCantidadAdevolver) + ")"
					qryUpd1 = qryUpd1 + " ,Sode_Estado = 40"
					qryUpd1 = qryUpd1 + " ,Sode_Observaciones = 'Actualiza devolucion a bodega'"
					qryUpd1 = qryUpd1 + " Where sode_id = " + strconv.Itoa(det[i].PiSodeID)
					qryUpd1 = qryUpd1 + " And sode_soli_id = " + strconv.Itoa(det[i].PiSoliID)
					qryUpd1 = qryUpd1 + " And HDGCODIGO = " + strconv.Itoa(res.PiHDGCodigo)
					qryUpd1 = qryUpd1 + " And ESACODIGO = " + strconv.Itoa(res.PiESACodigo)
					qryUpd1 = qryUpd1 + " And CMECODIGO = " + strconv.Itoa(res.PiCMECodigo)
					qryUpd1 = qryUpd1 + ";"
				}

				// Evento Detalle Sol
				qryIns1 = qryIns1 + " insert into CLIN_FAR_DETEVENTOSOLICITUD (SODE_ID, SOLI_ID, CODEVENTO, FECHA, OBSERVACION, CANTIDAD, USUARIO, LOTE, FECHAVTO, HDGCODIGO, ESACODIGO, CMECODIGO) values ("
				qryIns1 = qryIns1 + strconv.Itoa(det[i].PiSodeID)
				qryIns1 = qryIns1 + "," + strconv.Itoa(det[i].PiSoliID)
				qryIns1 = qryIns1 + "," + strconv.Itoa(90)
				qryIns1 = qryIns1 + ", sysdate"
				qryIns1 = qryIns1 + ", 'Actualiza detalle solicitud devolucion  parcial'"
				qryIns1 = qryIns1 + "," + strconv.Itoa(det[i].PiCantidadAdevolver)
				qryIns1 = qryIns1 + ",'" + res.PiUsuarioDespacha + "'"
				qryIns1 = qryIns1 + ",'" + det[i].PiLote + "'"
				qryIns1 = qryIns1 + ",to_date('" + det[i].PiFechaVto + "','YYYY-MM-DD') "
				qryIns1 = qryIns1 + "," + strconv.Itoa(res.PiHDGCodigo)
				qryIns1 = qryIns1 + "," + strconv.Itoa(res.PiESACodigo)
				qryIns1 = qryIns1 + "," + strconv.Itoa(res.PiCMECodigo) + ")"
				qryIns1 = qryIns1 + ";"

				NuevoIDMDev := GeneraNuevoIDMDev(res.PiServidor)
				VMDevID = NuevoIDMDev

				qryIns2 = qryIns2 + " INSERT INTO clin_far_movim_devol (MDEV_ID, MDEV_MFDE_ID, MDEV_MOVF_TIPO, MDEV_FECHA, MDEV_CANTIDAD"
				qryIns2 = qryIns2 + ", MDEV_RESPONSABLE, MDEV_CTAS_ID, MDEV_SOLI_ID, MDEV_AGRUPADOR_ID,INT_ERP_ESTADO, HDGCODIGO, ESACODIGO, CMECODIGO) values ( "
				qryIns2 = qryIns2 + strconv.Itoa(VMDevID)
				qryIns2 = qryIns2 + " ," + strconv.Itoa(det[i].PiMfDeID)
				qryIns2 = qryIns2 + " ,5"
				qryIns2 = qryIns2 + " ,sysdate"
				qryIns2 = qryIns2 + " ," + strconv.Itoa(det[i].PiCantidadAdevolver)
				qryIns2 = qryIns2 + " ,'" + res.PiUsuarioDespacha + "'"
				qryIns2 = qryIns2 + " , 0"
				qryIns2 = qryIns2 + " ," + strconv.Itoa(det[i].PiSoliID)
				qryIns2 = qryIns2 + " ," + strconv.Itoa(IDAgrupadorMovDev)
				qryIns2 = qryIns2 + " ,'PENDIENTE'"
				qryIns2 = qryIns2 + "," + strconv.Itoa(res.PiHDGCodigo)
				qryIns2 = qryIns2 + "," + strconv.Itoa(res.PiESACodigo)
				qryIns2 = qryIns2 + "," + strconv.Itoa(res.PiCMECodigo)
				qryIns2 = qryIns2 + " );"

				VMeInID, VCodMei, VBodOrigen, VBodDestino, err := DatosMovimiento(res.PiServidor, det[i].PiMfDeID)
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
				qryUpd2 = qryUpd2 + " And HDGCODIGO = " + strconv.Itoa(res.PiHDGCodigo)
				qryUpd2 = qryUpd2 + " And ESACODIGO = " + strconv.Itoa(res.PiESACodigo)
				qryUpd2 = qryUpd2 + " And CMECODIGO = " + strconv.Itoa(res.PiCMECodigo)
				qryUpd2 = qryUpd2 + ";"

				DescripcionMov, err := BuscaTipoMovim(5, res.PiServidor)
				if err != nil {
					logger.Error(logs.InformacionLog{
						Mensaje: "Se cayo busca tipo movimiento",
						Error:   err,
					})
					http.Error(w, err.Error(), http.StatusInternalServerError)
					return
				}

				// Registra en Kardex
				qryIns3 = qryIns3 + " insert into CLIN_FAR_KARDEX (KARD_ID, KARD_MEIN_ID, KARD_MEIN_CODMEI, KARD_FECHA, KARD_CANTIDAD, KARD_OPERACION, KARD_BOD_ORIGEN, KARD_BOD_DESTINO, KARD_MFDE_ID, KARD_MDEV_ID, KARD_DESCRIPCION, HDGCODIGO, ESACODIGO, CMECODIGO) values ( CLIN_KARD_SEQ.NEXTVAL, "
				qryIns3 = qryIns3 + strconv.Itoa(VMeInID)
				qryIns3 = qryIns3 + ", '" + VCodMei + "'"
				qryIns3 = qryIns3 + ", sysdate"
				qryIns3 = qryIns3 + ", " + strconv.Itoa(det[i].PiCantidadAdevolver)
				qryIns3 = qryIns3 + ", 'S'"
				qryIns3 = qryIns3 + ", " + strconv.Itoa(VBodDestino)
				qryIns3 = qryIns3 + ", " + strconv.Itoa(VBodOrigen)
				qryIns3 = qryIns3 + ", " + strconv.Itoa(det[i].PiMfDeID)
				qryIns3 = qryIns3 + ", " + strconv.Itoa(VMDevID)
				qryIns3 = qryIns3 + ", '" + DescripcionMov + "' "
				qryIns3 = qryIns3 + "," + strconv.Itoa(res.PiHDGCodigo)
				qryIns3 = qryIns3 + "," + strconv.Itoa(res.PiESACodigo)
				qryIns3 = qryIns3 + "," + strconv.Itoa(res.PiCMECodigo) + ")"
				qryIns3 = qryIns3 + ";"

				qry = qry + qryUpd1 + qryIns1 + qryIns2 + qryUpd2 + qryIns3
			}
		}
	}
	//-------------------------------------------------------------------------
	if valor == "NO" {
		if transaccion == 1 {
			qry = "BEGIN " + qry + " END;"
			ctx := context.Background()
			rowsT, err := db.QueryContext(ctx, qry)

			logger.Trace(logs.InformacionLog{Query: qry, Mensaje: "Query transaccion devolver autopedido"})

			if err != nil {
				logger.Error(logs.InformacionLog{
					Query:   qry,
					Mensaje: "Se cayo query transaccion devolver autopedido",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			defer rowsT.Close()
		}
	}
	//---------------------------------------

	// Cabecera Solicitud
	qry = "insert into CLIN_FAR_EVENTOSOLICITUD ( SOLI_ID, CODEVENTO, FECHA, OBSERVACION, USUARIO, HDGCODIGO, ESACODIGO, CMECODIGO) values ("
	qry = qry + strconv.Itoa(det[i].PiSoliID)
	qry = qry + "," + strconv.Itoa(80)
	qry = qry + ", sysdate"
	qry = qry + "," + "'Agrega devolucion '"
	qry = qry + ",'" + res.PiUsuarioDespacha + "' "
	qry = qry + "," + strconv.Itoa(res.PiHDGCodigo)
	qry = qry + "," + strconv.Itoa(res.PiESACodigo)
	qry = qry + "," + strconv.Itoa(res.PiCMECodigo) + ")"
	ctx := context.Background()
	rows, err := db.QueryContext(ctx, qry)

	logger.Trace(logs.InformacionLog{Query: qry, Mensaje: "Query crear evento agrega devolucion en devolver autopedido"})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   qry,
			Mensaje: "Se cayo query crear evento agrega devolucion en devolver autopedido",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var DevolTotal string

	// CABECERA SOLICITUD
	query := "SELECT sum(devol_parcial)  FROM"
	query = query + " (select SODE_CANT_SOLI, SODE_CANT_DEVO"
	query = query + "	,(case when SODE_CANT_SOLI > SODE_CANT_DEVO then 1  else 0 end ) devol_parcial "
	query = query + "  from clin_far_solicitudes_det where sode_soli_id =" + strconv.Itoa(det[i].PiSoliID) + ")"
	ctx = context.Background()
	rowstipodespacho, err := db.QueryContext(ctx, query)

	logger.Trace(logs.InformacionLog{Query: query, Mensaje: "Query recepcion parcial en devolver autopedido"})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query recepcion parcial en devolver autopedido",
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
				Mensaje: fmt.Sprintf("Se cayo scan en ind %d", ind),
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		DevolTotal = strVal1
		ind = ind + 1
	}
	defer rowstipodespacho.Close()

	if DevolTotal != "0" {
		query = "update clin_far_solicitudes"
		query = query + " set soli_estado = 78"
		query = query + " Where soli_id = " + strconv.Itoa(det[i].PiSoliID)
		ctx := context.Background()
		resupdsol, err := db.QueryContext(ctx, query)

		logger.Trace(logs.InformacionLog{Query: query, Mensaje: "Query actualizar estado 78 en devolver autopedido"})

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   query,
				Mensaje: "Se cayo query actualizar estado 78 en devolver autopedido",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer resupdsol.Close()

		// Evento Sol
		query = "insert into CLIN_FAR_EVENTOSOLICITUD ( SOLI_ID, CODEVENTO, FECHA, OBSERVACION, USUARIO, HDGCODIGO, ESACODIGO, CMECODIGO) values ("
		query = query + strconv.Itoa(det[i].PiSoliID)
		query = query + "," + strconv.Itoa(78)
		query = query + ", sysdate"
		query = query + "," + "'Actualiza recepcion solicitud'"
		query = query + ",'" + res.PiUsuarioDespacha + "' "
		query = query + "," + strconv.Itoa(res.PiHDGCodigo)
		query = query + "," + strconv.Itoa(res.PiESACodigo)
		query = query + "," + strconv.Itoa(res.PiCMECodigo) + ")"
		ctx = context.Background()
		rows, err := db.QueryContext(ctx, query)

		logger.Trace(logs.InformacionLog{Query: query, Mensaje: "Query crear ecento actualiza recepcion solicitud en devolver autopedido"})

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   query,
				Mensaje: "Se cayo query crear ecento actualiza recepcion solicitud en devolver autopedido",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()
	}

	if DevolTotal == "0" {
		query = "update clin_far_solicitudes"
		query = query + " set soli_estado = 75"
		query = query + " Where soli_id = " + strconv.Itoa(det[i].PiSoliID)
		ctx := context.Background()
		resupdsol, err := db.QueryContext(ctx, query)

		logger.Trace(logs.InformacionLog{Query: query, Mensaje: "Query"})

		logger.Trace(logs.InformacionLog{Query: query, Mensaje: "Query actualizar estado 75 en devolver autopedido"})

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   query,
				Mensaje: "Se cayo query actualizar estado 75 en devolver autopedido",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer resupdsol.Close()

		query = "insert into CLIN_FAR_EVENTOSOLICITUD ( SOLI_ID, CODEVENTO, FECHA, OBSERVACION, USUARIO, HDGCODIGO, ESACODIGO, CMECODIGO) values ("
		query = query + strconv.Itoa(det[i].PiSoliID)
		query = query + "," + strconv.Itoa(75)
		query = query + ", sysdate"
		query = query + "," + "'Actualiza recepcion solicitud'"
		query = query + ",'" + res.PiUsuarioDespacha + "' "
		query = query + "," + strconv.Itoa(res.PiHDGCodigo)
		query = query + "," + strconv.Itoa(res.PiESACodigo)
		query = query + "," + strconv.Itoa(res.PiCMECodigo) + ")"
		ctx = context.Background()
		rowsI, err := db.QueryContext(ctx, query)

		logger.Trace(logs.InformacionLog{Query: query, Mensaje: "Query crear evento actualiza recepcion solicitud en devolver autopedido"})

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   query,
				Mensaje: "Se cayo query crear evento actualiza recepcion solicitud en devolver autopedido",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		soliId = det[i].PiSoliID
		defer rowsI.Close()
	}

	// Input data.
	FOLIO := 0
	SobreGiro := false

	var param models.ParamFin700Movimiento
	param.HdgCodigo = res.PiHDGCodigo
	param.TipoMovimiento = 5
	param.IDAgrupador = IDAgrupadorMovDev
	param.NumeroMovimiento = 0
	param.SoliID = soliId
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
