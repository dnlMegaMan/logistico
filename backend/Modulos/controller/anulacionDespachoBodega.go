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

	paramg "sonda.com/logistico/Modulos/comun"
	"sonda.com/logistico/Modulos/models"
)

// AnulacionDespachoBodega is...
func AnulacionDespachoBodega(w http.ResponseWriter, r *http.Request) {
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
		http.Error(w, err.Error(), 500)
		return
	}
	// Unmarshal
	var msg models.Despachos
	err = json.Unmarshal(b, &msg)
	if err != nil {
		if strings.ToUpper(r.Method) != "OPTIONS" { // Solo si no es un Pre-flight del chrome
			logger.Error(logs.InformacionLog{
				Mensaje: "No puede hacer unmarshal del JSON de entrada",
				Error:   err,
			})
		}

		http.Error(w, err.Error(), 200)
		return
	}
	output, err := json.Marshal(msg)
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "No puede volver a crear JSON",
			Error:   err,
		})
		http.Error(w, err.Error(), 500)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	res := models.Despachos{}
	json.Unmarshal([]byte(output), &res)

	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	var MovfID int
	var PoSoliID int
	var PoSodeID int
	var PoCodMei string
	var PoMeInID int
	var PoCantSoli int
	var PoCantADesp int
	var PoCantDespa int
	var PoObservaci string
	var PoUsuarioDe string
	var PoEstID int
	var PoCtaID int
	var PoValCos float64
	var PoValVen int
	var PoUniDespa int
	var PoUniCompr int
	var PoIncFon string
	var PoCanDevo int
	var PoServidor string
	var PHDGCodigo int
	var SumaTotal int
	var validar int
	var BodOrigen int
	var BodDestino int
	var SumaSoli int
	var query string
	var NuevoIDMFDe int
	var VMfdeID int
	var DescripcionMov string

	var PESACodigo int
	var PCMECodigo int

	models.EnableCors(&w)
	det := res.Detalle

	// DATOS CABECERA SOLICITUD
	for i := range det {
		PoEstID = det[i].EstID
		PoCtaID = det[i].CtaID
		PoSoliID = det[i].SoliID
		PoServidor = det[i].Servidor
		PoCantADesp = det[i].CantADespachar
		PoCantDespa = det[i].CantDespachada
		PoCanDevo = det[i].CantDevo
		PoCantSoli = det[i].CantSoli
		PHDGCodigo = det[i].HDGCodigo
		PESACodigo = det[i].ESACodigo
		PCMECodigo = det[i].CMECodigo
		BodOrigen = det[i].BodOrigen
		BodDestino = det[i].BodDestino
		//Consumo = det[i].Consumo
		PoUsuarioDe = det[i].UsuarioDespacha
		SumaSoli = SumaSoli + det[i].CantSoli
		SumaTotal = SumaTotal + (PoCantADesp + PoCantDespa - PoCanDevo)
	}

	validar, err = BuscarIDMovimientoFarmacia(PoEstID, PoCtaID, PoSoliID, PoServidor)
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "Fallo buscar ID movimiento farmacia",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	MovfID = validar

	db, _ := database.GetConnection(PoServidor)

	//-------------------------------------------------------------------------
	qryUpd1 := ""
	qryUpd2 := ""
	qryIns1 := ""
	qryIns2 := ""
	qryIns3 := ""
	query = ""
	transaccion := 0
	//-------------------------------------------------------------------------

	// genero secuencia de agrupador para referencia contable
	IDAgrupador, err := GeneraSecidAgrupador(PoServidor)
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "Fallo GeneraSecidAgrupador",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	valor, err := paramg.ObtenerClinFarParamGeneral(db, "selectorIdioma")
	if err != nil {
		http.Error(w, "Error interno del servidor", http.StatusInternalServerError)
		logger.Error(logs.InformacionLog{
			Mensaje: "Error al obtener el valor del parametro",
			Error:   err,
		})
		return
	}

	if valor == "SI" {
		logger.Trace(logs.InformacionLog{Mensaje: "Entro en la solucion ANULACION_DESPACHO_BODEGA"})
		jsonEntrada, _ := json.Marshal(det)
		res1 := strings.Replace(string(jsonEntrada), "{\"paramdespachos\":", "", 3)
		In_Json := strings.Replace(string(res1), "}]}", "}]", 22)
		transaccion, err := db.Begin()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "No puede crear transaccion para devolver ANULACION_DESPACHO_BODEGA",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		qry := "BEGIN PKG_ANULACION_DESPACHO_BOD.P_ANULACION_DESPACHO_BOD(:1,:2); END;"

		logger.Trace(logs.InformacionLog{
			Query:   qry,
			Mensaje: "Ejecución Package ANULACION_DESPACHO_BODEGA",
		})

		_, err = transaccion.Exec(qry,
			PlSQLArrays,
			In_Json,     //:1
			IDAgrupador, //:2
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   qry,
				Mensaje: "Fallo package ANULACION_DESPACHO_BODEGA",
				Error:   err,
				Contexto: map[string]interface{}{
					":1": In_Json,
					":2": IDAgrupador,
				},
			})

			errRollback := transaccion.Rollback()
			if errRollback != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo rollback package ANULACION_DESPACHO_BODEGA",
					Error:   errRollback,
				})
			}

			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		err = transaccion.Commit()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo commit ANULACION_DESPACHO_BODEGA",
				Error:   err,
			})
			defer transaccion.Rollback()
		}
	} else {
		// DETALLE  SOLICITUD
		for i := range det {
			transaccion = 1
			qryUpd1 = ""
			qryUpd2 = ""
			qryIns1 = ""
			qryIns2 = ""
			qryIns3 = ""
			PoSoliID = det[i].SoliID
			PoSodeID = det[i].SodeID
			PoCodMei = det[i].CodMei
			PoMeInID = det[i].MeInID
			PoCantSoli = det[i].CantSoli
			PoCantADesp = det[i].CantADespachar
			PoCantDespa = det[i].CantDespachada
			PoObservaci = det[i].Observaciones
			PoUsuarioDe = det[i].UsuarioDespacha
			PoEstID = det[i].EstID
			PoCtaID = det[i].CtaID
			PoValCos = det[i].ValCosto
			PoValVen = det[i].ValVenta
			PoUniDespa = det[i].UniDespachocod
			PoUniCompr = det[i].UniCompracod
			PoIncFon = det[i].IncobFon
			PoCanDevo = det[i].CantDevo
			PoServidor = det[i].Servidor

			PHDGCodigo = det[i].HDGCodigo
			PESACodigo = det[i].ESACodigo
			PCMECodigo = det[i].CMECodigo

			if PoCantDespa != 0 {
				qryUpd1 = qryUpd1 + " update clin_far_solicitudes"
				qryUpd1 = qryUpd1 + " set SOLI_ESTADO = 10" // creada
				qryUpd1 = qryUpd1 + " Where soli_id = " + strconv.Itoa(PoSoliID)
				qryUpd1 = qryUpd1 + ";"

				qryUpd1 = qryUpd1 + " update clin_far_solicitudes_det"
				qryUpd1 = qryUpd1 + " set sode_cant_desp = 0 "
				qryUpd1 = qryUpd1 + " , Sode_Estado = 10" // creada
				qryUpd1 = qryUpd1 + " , Sode_Observaciones = '" + PoObservaci + "'"
				qryUpd1 = qryUpd1 + " Where sode_id = " + strconv.Itoa(PoSodeID)
				qryUpd1 = qryUpd1 + " And sode_soli_id = " + strconv.Itoa(PoSoliID)
				qryUpd1 = qryUpd1 + " AND HDGCODIGO = " + strconv.Itoa(PHDGCodigo)
				qryUpd1 = qryUpd1 + " AND ESACODIGO = " + strconv.Itoa(PESACodigo)
				qryUpd1 = qryUpd1 + " AND CMECODIGO = " + strconv.Itoa(PCMECodigo)
				qryUpd1 = qryUpd1 + ";"

				// Evento Det Sol
				if PoCantSoli != PoCantDespa {
					qryIns1 = qryIns1 + " Insert into CLIN_FAR_EVENTOSOLICITUD (SOLI_ID,CODEVENTO,FECHA,OBSERVACION,USUARIO,HDGCODIGO,ESACODIGO,CMECODIGO) values ("
					qryIns1 = qryIns1 + strconv.Itoa(PoSoliID)
					qryIns1 = qryIns1 + "," + strconv.Itoa(41)
					qryIns1 = qryIns1 + ", sysdate"
					qryIns1 = qryIns1 + "," + "'ACTUALIZA DETALLE SOLICITUD ' || (SELECT FPAR_DESCRIPCION FROM CLIN_FAR_PARAM WHERE FPAR_TIPO = 48 AND FPAR_CODIGO = 41)"
					qryIns1 = qryIns1 + ",'" + PoUsuarioDe + "'"
					qryIns1 = qryIns1 + "," + strconv.Itoa(PHDGCodigo)
					qryIns1 = qryIns1 + "," + strconv.Itoa(PESACodigo)
					qryIns1 = qryIns1 + "," + strconv.Itoa(PCMECodigo) + ")"

					qryIns1 = qryIns1 + ";"

					qryIns1 = qryIns1 + " INSERT INTO CLIN_FAR_DETEVENTOSOLICITUD (SODE_ID, SOLI_ID, CODEVENTO, FECHA, OBSERVACION, CANTIDAD, USUARIO, LOTE, FECHAVTO,HDGCODIGO,ESACODIGO,CMECODIGO) values ("
					qryIns1 = qryIns1 + strconv.Itoa(PoSodeID)
					qryIns1 = qryIns1 + "," + strconv.Itoa(PoSoliID)
					qryIns1 = qryIns1 + "," + strconv.Itoa(41)
					qryIns1 = qryIns1 + ", sysdate"
					qryIns1 = qryIns1 + "," + "'ACTUALIZA DETALLE SOLICITUD ' || (SELECT FPAR_DESCRIPCION FROM CLIN_FAR_PARAM WHERE FPAR_TIPO = 48 AND FPAR_CODIGO = 41)"
					qryIns1 = qryIns1 + "," + strconv.Itoa(PoCantSoli)
					qryIns1 = qryIns1 + ",'" + PoUsuarioDe + "'"
					qryIns1 = qryIns1 + ",'" + det[i].Lote + "'"
					qryIns1 = qryIns1 + ",to_date('" + det[i].FechaVto + "','YYYY-MM-DD')"
					qryIns1 = qryIns1 + "," + strconv.Itoa(PHDGCodigo)
					qryIns1 = qryIns1 + "," + strconv.Itoa(PESACodigo)
					qryIns1 = qryIns1 + "," + strconv.Itoa(PCMECodigo) + ")"
					qryIns1 = qryIns1 + ";"
				}

				if PoCantSoli == PoCantDespa {
					qryIns1 = qryIns1 + " Insert into CLIN_FAR_EVENTOSOLICITUD (SOLI_ID,CODEVENTO,FECHA,OBSERVACION,USUARIO,HDGCODIGO,ESACODIGO,CMECODIGO) values ("
					qryIns1 = qryIns1 + strconv.Itoa(PoSoliID)
					qryIns1 = qryIns1 + "," + strconv.Itoa(41)
					qryIns1 = qryIns1 + ", sysdate"
					qryIns1 = qryIns1 + "," + "'ACTUALIZA DETALLE SOLICITUD ' || (SELECT FPAR_DESCRIPCION FROM CLIN_FAR_PARAM WHERE FPAR_TIPO = 48 AND FPAR_CODIGO = 41)"
					qryIns1 = qryIns1 + ",'" + PoUsuarioDe + "'"
					qryIns1 = qryIns1 + "," + strconv.Itoa(PHDGCodigo)
					qryIns1 = qryIns1 + "," + strconv.Itoa(PESACodigo)
					qryIns1 = qryIns1 + "," + strconv.Itoa(PCMECodigo) + ")"
					qryIns1 = qryIns1 + ";"

					qryIns1 = qryIns1 + " INSERT INTO CLIN_FAR_DETEVENTOSOLICITUD (SODE_ID, SOLI_ID, CODEVENTO, FECHA, OBSERVACION, CANTIDAD, USUARIO, LOTE, FECHAVTO,HDGCODIGO,ESACODIGO,CMECODIGO) values ("
					qryIns1 = qryIns1 + strconv.Itoa(PoSodeID)
					qryIns1 = qryIns1 + "," + strconv.Itoa(PoSoliID)
					qryIns1 = qryIns1 + "," + strconv.Itoa(51)
					qryIns1 = qryIns1 + ", sysdate"
					qryIns1 = qryIns1 + "," + "'ACTUALIZA DETALLE SOLICITUD ' || (SELECT FPAR_DESCRIPCION FROM CLIN_FAR_PARAM WHERE FPAR_TIPO = 48 AND FPAR_CODIGO = 51)"
					qryIns1 = qryIns1 + "," + strconv.Itoa(PoCantSoli)
					qryIns1 = qryIns1 + ",'" + PoUsuarioDe + "'"
					qryIns1 = qryIns1 + ",'" + det[i].Lote + "'"
					qryIns1 = qryIns1 + ",to_date('" + det[i].FechaVto + "','YYYY-MM-DD')"
					qryIns1 = qryIns1 + "," + strconv.Itoa(PHDGCodigo)
					qryIns1 = qryIns1 + "," + strconv.Itoa(PESACodigo)
					qryIns1 = qryIns1 + "," + strconv.Itoa(PCMECodigo) + ")"
					qryIns1 = qryIns1 + ";"
				}

				validar, err = BuscarIDMovimientoFarmacia(PoEstID, PoCtaID, PoSoliID, PoServidor)
				if err != nil {
					logger.Error(logs.InformacionLog{
						Mensaje: "Fallo buscar ID movimiento farmacia",
						Error:   err,
					})
					http.Error(w, err.Error(), http.StatusInternalServerError)
					return
				}

				MovfID = validar

				NuevoIDMFDe = GeneraNuevoidMFDEid(PoServidor)
				VMfdeID = NuevoIDMFDe

				qryIns2 = qryIns2 + " INSERT INTO clin_far_movimdet (MfDe_ID, mfde_movf_id, mfde_fecha, mfde_tipo_mov, mfde_mein_codmei, mfde_mein_id"
				qryIns2 = qryIns2 + ", mfde_cantidad, mfde_valor_costo_unitario, mfde_valor_venta_unitario, mfde_unidad_compra, mfde_unidad_despacho"
				qryIns2 = qryIns2 + ", mfde_ctas_id, mfde_incob_fonasa, mfde_lote, mfde_lote_fechavto, MFDE_SOLI_ID, MFDE_AGRUPADOR_ID,INT_ERP_ESTADO,HDGCODIGO,ESACODIGO,CMECODIGO) values ( "
				qryIns2 = qryIns2 + strconv.Itoa(VMfdeID)
				qryIns2 = qryIns2 + "," + strconv.Itoa(MovfID)
				qryIns2 = qryIns2 + ", sysdate"
				qryIns2 = qryIns2 + "," + strconv.Itoa(31)
				qryIns2 = qryIns2 + ",'" + PoCodMei + "'"
				qryIns2 = qryIns2 + "," + strconv.Itoa(PoMeInID)
				qryIns2 = qryIns2 + "," + strconv.Itoa(PoCantADesp)
				qryIns2 = qryIns2 + "," + strconv.FormatFloat(PoValCos, 'g', 1, 64)
				qryIns2 = qryIns2 + "," + strconv.Itoa(PoValVen)
				qryIns2 = qryIns2 + "," + strconv.Itoa(PoUniCompr)
				qryIns2 = qryIns2 + "," + strconv.Itoa(PoUniDespa)
				qryIns2 = qryIns2 + "," + strconv.Itoa(PoCtaID)
				qryIns2 = qryIns2 + ",'" + PoIncFon + "'"
				qryIns2 = qryIns2 + ",'" + det[i].Lote + "'"
				qryIns2 = qryIns2 + ", to_date('" + det[i].FechaVto + "','YYYY-MM-DD')    "
				qryIns2 = qryIns2 + ", " + strconv.Itoa(PoSoliID)
				qryIns2 = qryIns2 + ", " + strconv.Itoa(IDAgrupador)
				qryIns2 = qryIns2 + ",'PENDIENTE' "
				qryIns2 = qryIns2 + "," + strconv.Itoa(PHDGCodigo)
				qryIns2 = qryIns2 + "," + strconv.Itoa(PESACodigo)
				qryIns2 = qryIns2 + "," + strconv.Itoa(PCMECodigo)
				qryIns2 = qryIns2 + " );"

				//Actualiza stock BODEGAS_INV
				qryUpd2 = qryUpd2 + " UPDATE CLIN_FAR_BODEGAS_INV "
				qryUpd2 = qryUpd2 + " SET FBOI_STOCK_ACTUAL  = (nvl(FBOI_STOCK_ACTUAL ,0) + " + strconv.Itoa(PoCantDespa) + ")"
				qryUpd2 = qryUpd2 + " WHERE FBOI_FBOD_CODIGO  = " + strconv.Itoa(BodOrigen)
				qryUpd2 = qryUpd2 + " AND FBOI_MEIN_ID  = " + strconv.Itoa(PoMeInID)
				qryUpd2 = qryUpd2 + " AND HDGCODIGO = " + strconv.Itoa(PHDGCodigo)
				qryUpd2 = qryUpd2 + " AND ESACODIGO = " + strconv.Itoa(PESACodigo)
				qryUpd2 = qryUpd2 + " AND CMECODIGO = " + strconv.Itoa(PCMECodigo)
				qryUpd2 = qryUpd2 + ";"

				DescripcionMov, err = BuscaTipoMovim(31, PoServidor)
				if err != nil {
					logger.Error(logs.InformacionLog{
						Mensaje: "Se cayo busca tipo movimiento",
						Error:   err,
					})
					http.Error(w, err.Error(), http.StatusInternalServerError)
					return
				}

				// Registra en Kardex
				qryIns3 = qryIns3 + " INSERT INTO CLIN_FAR_KARDEX (KARD_ID, KARD_MEIN_ID, KARD_MEIN_CODMEI, KARD_FECHA, KARD_CANTIDAD, KARD_OPERACION, KARD_BOD_ORIGEN, KARD_BOD_DESTINO, KARD_MFDE_ID, KARD_DESCRIPCION,HDGCODIGO,ESACODIGO,CMECODIGO) values ( CLIN_KARD_SEQ.NEXTVAL "
				qryIns3 = qryIns3 + ", " + strconv.Itoa(PoMeInID)
				qryIns3 = qryIns3 + ", '" + PoCodMei + "'"
				qryIns3 = qryIns3 + ", sysdate"
				qryIns3 = qryIns3 + ", " + strconv.Itoa(PoCantDespa)
				qryIns3 = qryIns3 + ", 'S'"
				qryIns3 = qryIns3 + ", " + strconv.Itoa(BodOrigen)
				qryIns3 = qryIns3 + ", " + strconv.Itoa(BodDestino)
				qryIns3 = qryIns3 + ", " + strconv.Itoa(VMfdeID)
				qryIns3 = qryIns3 + ", '" + DescripcionMov + "'"
				qryIns3 = qryIns3 + "," + strconv.Itoa(PHDGCodigo)
				qryIns3 = qryIns3 + "," + strconv.Itoa(PESACodigo)
				qryIns3 = qryIns3 + "," + strconv.Itoa(PCMECodigo) + ")"
				qryIns3 = qryIns3 + ";"

			}

			query = query + qryUpd1 + qryIns1 + qryIns2 + qryUpd2 + qryIns3
		}

		//-------------------------------------------------------------------------
		if transaccion == 1 {
			query = "BEGIN " + query + " END;"

			logger.Trace(logs.InformacionLog{Query: query, Mensaje: "Transaccion anula depacho bodega"})

			ctx := context.Background()
			rowsT, err := db.QueryContext(ctx, query)
			if err != nil {
				logger.Error(logs.InformacionLog{
					Query:   query,
					Mensaje: "Se cayo query anula depacho bodega",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			defer rowsT.Close()
		}
	}

	//-------------------------------------------------------------------------

	// Input data.
	FOLIO := 0
	SobreGiro := false

	var param models.ParamFin700Movimiento
	param.HdgCodigo = PHDGCodigo
	param.TipoMovimiento = 31
	param.IDAgrupador = IDAgrupador
	param.NumeroMovimiento = 0
	param.SoliID = PoSoliID
	param.Servidor = PoServidor
	param.Usuario = PoUsuarioDe
	param.SobreGiro = SobreGiro
	param.IntegraFin700, _ = paramg.ObtenerClinFarParamGeneral(db, "intFin700")
	param.DB = db

	if param.IntegraFin700 == "SI" {
		param.NumeroMovimiento = 0
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

	//jsonSalida, _ := json.Marshal(retorno_valores)
	//log.Println("*************************************jsonSalida (despachosolicitudbodega): ", string(jsonSalida))

	logger.LoguearSalida()
}
