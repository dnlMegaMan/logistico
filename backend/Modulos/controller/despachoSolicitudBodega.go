package controller

import (
	"context"
	"encoding/json"
	"fmt"
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

// DespachoSolicitudBodega is...
func DespachoSolicitudBodega(w http.ResponseWriter, r *http.Request) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	models.EnableCors(&w) // abrir el archivo logger.log para escritura

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
	var msg models.Despachos
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
	var PESACodigo int
	var PCMECodigo int
	var SumaTotal int
	var validar int
	var VaCanSuma int
	var BodOrigen int
	var BodDestino int
	var SumaSoli int
	var ValTotal float64
	var DespachaTotal string // '0'=No, '1'= Si
	var Suma float64
	var query string
	var NuevoIDMFDe int
	var VMfdeID int
	var DescripcionMov string
	var Consumo string

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
		Consumo = det[i].Consumo
		PoUsuarioDe = det[i].UsuarioDespacha
		SumaSoli = SumaSoli + det[i].CantSoli
		SumaTotal = SumaTotal + (PoCantADesp + PoCantDespa - PoCanDevo)
		Suma = float64(SumaTotal)
		ValTotal = Suma * PoValCos
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

	db, _ := database.GetConnection(PoServidor)
	MovfID = validar

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

	valor, err := paramg.ObtenerClinFarParamGeneral(db, "usaPCKDesSolBod")
	if err != nil {
		http.Error(w, "Error interno del servidor", http.StatusInternalServerError)
		logger.Error(logs.InformacionLog{
			Mensaje: "Error al obtener el valor del parámetro",
			Error:   err,
		})
		return
	}

	if valor == "SI" {
		logger.Trace(logs.InformacionLog{Mensaje: "Entro en la solucion DESPACHO_SOLICITUD_BODEGA"})
		jsonEntrada, _ := json.Marshal(det)
		res1 := strings.Replace(string(jsonEntrada), "{\"paramdespachos\":", "", 3)
		In_Json := strings.Replace(string(res1), "}]}", "}]", 22)
		transaccion, err := db.Begin()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "No puede crear transacción para devolver DESPACHO_SOLICITUD_BODEGA",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		qry := "BEGIN PKG_DESPACHO_SOLICITUD_BODEGA.P_DESPACHO_SOLICITUD_BODEGA(:1,:2,:3,:4,:5,:6,:7,:8,:9,:10,:11,:12,:13); END;"

		logger.Trace(logs.InformacionLog{
			Query:   qry,
			Mensaje: "Ejecución Package DESPACHO_SOLICITUD_BODEGA",
		})
		_, err = transaccion.Exec(qry,
			PlSQLArrays,
			In_Json,     //:1
			validar,     //:2
			PHDGCodigo,  //:3
			PESACodigo,  //:4
			PCMECodigo,  //:5
			PoUsuarioDe, //:6
			PoSoliID,    //:7
			BodOrigen,   //:8
			BodDestino,  //:9
			SumaSoli,    //:10
			ValTotal,    //:11
			IDAgrupador, //:12
			Consumo,     //:13
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   qry,
				Mensaje: "Fallo package DESPACHO_SOLICITUD_BODEGA",
				Error:   err,
				Contexto: map[string]interface{}{
					":1":  In_Json,
					":2":  validar,
					":3":  PHDGCodigo,
					":4":  PESACodigo,
					":5":  PCMECodigo,
					":6":  PoUsuarioDe,
					":7":  PoSoliID,
					":8":  BodOrigen,
					":9":  BodDestino,
					":10": SumaSoli,
					":11": ValTotal,
					":12": IDAgrupador,
					":13": Consumo,
				},
			})

			errRollback := transaccion.Rollback()
			if errRollback != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo rollback package DESPACHO_SOLICITUD_BODEGA",
					Error:   errRollback,
				})
			}

			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		err = transaccion.Commit()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo commit DESPACHO_SOLICITUD_BODEGA",
				Error:   err,
			})
			defer transaccion.Rollback()
		}
	} else {
		// CABECERA SOLICITUD
		if validar == 0 {
			query = "INSERT INTO clin_far_movim ( MOVF_TIPO, HDGCODIGO, ESACODIGO, CMECODIGO, MOVF_FECHA, MOVF_USUARIO, MOVF_SOLI_ID, MOVF_BOD_ORIGEN, MOVF_BOD_DESTINO, MOVF_ESTID, MOVF_CTA_ID, MOVF_CANTIDAD, MOVF_Valor_Total, MOVF_RUT_PACIENTE, MOVF_FECHA_GRABACION )"
			query = query + "values (100"
			query = query + "," + strconv.Itoa(PHDGCodigo)
			query = query + "," + strconv.Itoa(PESACodigo)
			query = query + "," + strconv.Itoa(PCMECodigo)
			query = query + ", sysdate "
			query = query + ",'" + PoUsuarioDe + "'"
			query = query + "," + strconv.Itoa(PoSoliID)
			query = query + "," + strconv.Itoa(BodOrigen)
			query = query + "," + strconv.Itoa(BodDestino)
			query = query + "," + strconv.Itoa(0)
			query = query + "," + strconv.Itoa(0)
			query = query + "," + strconv.Itoa(SumaSoli)
			query = query + "," + strconv.FormatFloat(ValTotal, 'g', 1, 64)
			query = query + ",''"
			query = query + ", sysdate )"
			ctx := context.Background()
			rows, err := db.QueryContext(ctx, query)

			logger.Trace(logs.InformacionLog{Query: query, Mensaje: "Query insertar movimiento en despacho solicitud bodega"})

			if err != nil {
				logger.Error(logs.InformacionLog{
					Query:   query,
					Mensaje: "Se cayo query insertar movimiento en despacho solicitud bodega",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			defer rows.Close()
		}

		//-------------------------------------------------------------------------
		qryUpd1 := ""
		qryUpd2 := ""
		qryIns1 := ""
		qryIns2 := ""
		qryIns3 := ""
		query = ""
		transaccion := 0
		//-------------------------------------------------------------------------

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

			VaCanSuma = PoCantADesp + PoCantDespa - PoCanDevo

			if PoCantADesp != 0 {
				if VaCanSuma < PoCantSoli {
					qryUpd1 = qryUpd1 + " update clin_far_solicitudes_det"
					qryUpd1 = qryUpd1 + " set sode_cant_desp = (nvl(sode_cant_desp,0) + " + strconv.Itoa(PoCantADesp) + ")"
					qryUpd1 = qryUpd1 + " , Sode_Estado = 40"
					qryUpd1 = qryUpd1 + " , Sode_Observaciones = '" + PoObservaci + "'"
					qryUpd1 = qryUpd1 + " Where sode_id = " + strconv.Itoa(PoSodeID)
					qryUpd1 = qryUpd1 + " And sode_soli_id = " + strconv.Itoa(PoSoliID)
					qryUpd1 = qryUpd1 + " AND HDGCODIGO =" + strconv.Itoa(PHDGCodigo)
					qryUpd1 = qryUpd1 + " AND ESACODIGO =" + strconv.Itoa(PESACodigo)
					qryUpd1 = qryUpd1 + " AND CMECODIGO =" + strconv.Itoa(PCMECodigo)
					qryUpd1 = qryUpd1 + ";"

					// Evento Det Sol
					qryIns1 = qryIns1 + " INSERT INTO CLIN_FAR_DETEVENTOSOLICITUD (SODE_ID, SOLI_ID, CODEVENTO, FECHA, OBSERVACION, CANTIDAD, USUARIO, LOTE, FECHAVTO, HDGCODIGO, ESACODIGO, CMECODIGO) values ("
					qryIns1 = qryIns1 + strconv.Itoa(PoSodeID)
					qryIns1 = qryIns1 + "," + strconv.Itoa(PoSoliID)
					qryIns1 = qryIns1 + "," + strconv.Itoa(40)
					qryIns1 = qryIns1 + ", sysdate"
					qryIns1 = qryIns1 + "," + "'Actualiza detalle solicitud despacho parcial'"
					qryIns1 = qryIns1 + "," + strconv.Itoa(PoCantADesp)
					qryIns1 = qryIns1 + ",'" + PoUsuarioDe + "'"
					qryIns1 = qryIns1 + ",'" + det[i].Lote + "'"
					qryIns1 = qryIns1 + ",to_date('" + det[i].FechaVto + "','DD-MM-YYYY') "
					qryIns1 = qryIns1 + "," + strconv.Itoa(PHDGCodigo)
					qryIns1 = qryIns1 + "," + strconv.Itoa(PESACodigo)
					qryIns1 = qryIns1 + "," + strconv.Itoa(PCMECodigo)
					qryIns1 = qryIns1 + ");"

				}

				if VaCanSuma == PoCantSoli {
					qryUpd1 = qryUpd1 + " update clin_far_solicitudes_det"
					qryUpd1 = qryUpd1 + " set sode_cant_desp = (nvl(sode_cant_desp,0) + " + strconv.Itoa(PoCantADesp) + ")"
					qryUpd1 = qryUpd1 + " , Sode_Estado = 50"
					qryUpd1 = qryUpd1 + " , Sode_Observaciones = '" + PoObservaci + "'"
					qryUpd1 = qryUpd1 + " Where sode_id = " + strconv.Itoa(PoSodeID)
					qryUpd1 = qryUpd1 + " And sode_soli_id = " + strconv.Itoa(PoSoliID)
					qryUpd1 = qryUpd1 + " AND HDGCODIGO =" + strconv.Itoa(PHDGCodigo)
					qryUpd1 = qryUpd1 + " AND ESACODIGO =" + strconv.Itoa(PESACodigo)
					qryUpd1 = qryUpd1 + " AND CMECODIGO =" + strconv.Itoa(PCMECodigo)
					qryUpd1 = qryUpd1 + ";"

					// Evento Det Sol
					qryIns1 = qryIns1 + " INSERT INTO CLIN_FAR_DETEVENTOSOLICITUD (SODE_ID, SOLI_ID, CODEVENTO, FECHA, OBSERVACION, CANTIDAD, USUARIO, LOTE, FECHAVTO, HDGCODIGO, ESACODIGO, CMECODIGO) values ("
					qryIns1 = qryIns1 + strconv.Itoa(PoSodeID)
					qryIns1 = qryIns1 + "," + strconv.Itoa(PoSoliID)
					qryIns1 = qryIns1 + "," + strconv.Itoa(50)
					qryIns1 = qryIns1 + ", sysdate"
					qryIns1 = qryIns1 + "," + "'Actualiza detalle solicitud despacho total'"
					qryIns1 = qryIns1 + "," + strconv.Itoa(PoCantADesp)
					qryIns1 = qryIns1 + ",'" + PoUsuarioDe + "'"
					qryIns1 = qryIns1 + ",'" + det[i].Lote + "'"
					qryIns1 = qryIns1 + ",to_date('" + det[i].FechaVto + "','DD-MM-YYYY') "
					qryIns1 = qryIns1 + "," + strconv.Itoa(PHDGCodigo)
					qryIns1 = qryIns1 + "," + strconv.Itoa(PESACodigo)
					qryIns1 = qryIns1 + "," + strconv.Itoa(PCMECodigo)
					qryIns1 = qryIns1 + ");"

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
				qryIns2 = qryIns2 + ", mfde_ctas_id, mfde_incob_fonasa, mfde_lote, mfde_lote_fechavto, MFDE_SOLI_ID, MFDE_AGRUPADOR_ID,INT_ERP_ESTADO, HDGCODIGO, ESACODIGO, CMECODIGO) values ( "
				qryIns2 = qryIns2 + strconv.Itoa(VMfdeID)
				qryIns2 = qryIns2 + "," + strconv.Itoa(MovfID)
				qryIns2 = qryIns2 + ", sysdate"
				qryIns2 = qryIns2 + "," + strconv.Itoa(100)
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
				qryIns2 = qryIns2 + ", to_date('" + det[i].FechaVto + "','DD-MM-YYYY')    "
				qryIns2 = qryIns2 + ", " + strconv.Itoa(PoSoliID)
				qryIns2 = qryIns2 + ", " + strconv.Itoa(IDAgrupador)
				qryIns2 = qryIns2 + ",'PENDIENTE' "
				qryIns2 = qryIns2 + "," + strconv.Itoa(PHDGCodigo)
				qryIns2 = qryIns2 + "," + strconv.Itoa(PESACodigo)
				qryIns2 = qryIns2 + "," + strconv.Itoa(PCMECodigo)
				qryIns2 = qryIns2 + " );"

				//Actualiza stock BODEGAS_INV
				qryUpd2 = qryUpd2 + " UPDATE CLIN_FAR_BODEGAS_INV "
				qryUpd2 = qryUpd2 + " SET FBOI_STOCK_ACTUAL  = (nvl(FBOI_STOCK_ACTUAL ,0) - " + strconv.Itoa(PoCantADesp) + ")"
				qryUpd2 = qryUpd2 + " WHERE FBOI_FBOD_CODIGO  = " + strconv.Itoa(BodDestino)
				qryUpd2 = qryUpd2 + " AND FBOI_MEIN_ID  = " + strconv.Itoa(PoMeInID)
				qryUpd2 = qryUpd2 + " AND HDGCODIGO =" + strconv.Itoa(PHDGCodigo)
				qryUpd2 = qryUpd2 + " AND ESACODIGO =" + strconv.Itoa(PESACodigo)
				qryUpd2 = qryUpd2 + " AND CMECODIGO =" + strconv.Itoa(PCMECodigo)
				qryUpd2 = qryUpd2 + ";"

				DescripcionMov, err = BuscaTipoMovim(100, PoServidor)
				if err != nil {
					logger.Error(logs.InformacionLog{
						Mensaje: "Se cayo busca tipo movimiento",
						Error:   err,
					})
					http.Error(w, err.Error(), http.StatusInternalServerError)
					return
				}

				// Registra en Kardex
				qryIns3 = qryIns3 + " INSERT INTO CLIN_FAR_KARDEX (KARD_ID, KARD_MEIN_ID, KARD_MEIN_CODMEI, KARD_FECHA, KARD_CANTIDAD, KARD_OPERACION, KARD_BOD_ORIGEN, KARD_BOD_DESTINO, KARD_MFDE_ID, KARD_DESCRIPCION, HDGCODIGO, ESACODIGO, CMECODIGO) values ( CLIN_KARD_SEQ.NEXTVAL "
				qryIns3 = qryIns3 + ", " + strconv.Itoa(PoMeInID)
				qryIns3 = qryIns3 + ", '" + PoCodMei + "'"
				qryIns3 = qryIns3 + ", sysdate"
				qryIns3 = qryIns3 + ", " + strconv.Itoa(PoCantADesp)
				qryIns3 = qryIns3 + ", 'R'"
				qryIns3 = qryIns3 + ", " + strconv.Itoa(BodOrigen)
				qryIns3 = qryIns3 + ", " + strconv.Itoa(BodDestino)
				qryIns3 = qryIns3 + ", " + strconv.Itoa(VMfdeID)
				qryIns3 = qryIns3 + ", '" + DescripcionMov + "' "
				qryIns3 = qryIns3 + "," + strconv.Itoa(PHDGCodigo)
				qryIns3 = qryIns3 + "," + strconv.Itoa(PESACodigo)
				qryIns3 = qryIns3 + "," + strconv.Itoa(PCMECodigo)
				qryIns3 = qryIns3 + ");"

			}

			query = query + qryUpd1 + qryIns1 + qryIns2 + qryUpd2 + qryIns3
		}

		//-------------------------------------------------------------------------
		if transaccion == 1 {
			query = "BEGIN " + query + " END;"
			ctx := context.Background()
			rowsT, err := db.QueryContext(ctx, query)

			logger.Trace(logs.InformacionLog{Query: query, Mensaje: "Query despacho solicitud bidega"})

			if err != nil {
				logger.Error(logs.InformacionLog{
					Query:   query,
					Mensaje: "Se cayo query despacho solicitud bidega",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			defer rowsT.Close()
		}
		//-------------------------------------------------------------------------

		// CABECERA SOLICITUD
		query = "SELECT NVL(SUM(despachado_parcial),0) "
		query = query + " from (select SODE_CANT_SOLI,SODE_CANT_DESP ,(case when SODE_CANT_SOLI <= SODE_CANT_DESP then 0  else 1 end ) despachado_parcial "
		query = query + " from clin_far_solicitudes_det where sode_soli_id =" + strconv.Itoa(PoSoliID)
		query = query + " AND HDGCODIGO =" + strconv.Itoa(PHDGCodigo)
		query = query + " AND ESACODIGO =" + strconv.Itoa(PESACodigo)
		query = query + " AND CMECODIGO =" + strconv.Itoa(PCMECodigo)
		query = query + " and SODE_ESTADO <> 110 )"

		ctx := context.Background()
		rowstipodespacho, err := db.QueryContext(ctx, query)

		logger.Trace(logs.InformacionLog{Query: query, Mensaje: "Query despachado parcial despacho solicitud bodega"})

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   query,
				Mensaje: "Se cayo query despachado parcial despacho solicitud bodega",
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
					Mensaje: fmt.Sprintf("Se cayo scan despachado parcial despacho solicitud bodega en ind %d", ind),
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			DespachaTotal = strVal1
			ind = ind + 1
		}
		defer rowstipodespacho.Close()

		if DespachaTotal != "0" {
			query = "update clin_far_solicitudes"
			query = query + " set soli_estado = 40"
			query = query + " Where soli_id =" + strconv.Itoa(PoSoliID)
			ctx := context.Background()
			resupdsol, err := db.QueryContext(ctx, query)

			logger.Trace(logs.InformacionLog{Query: query, Mensaje: "Query actualizar estado solicitud a 40 para despacho solicitud bodega"})

			if err != nil {
				logger.Error(logs.InformacionLog{
					Query:   query,
					Mensaje: "Se cayo query actualizar estado solicitud a 40 para despacho solicitud bodega",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			defer resupdsol.Close()

			// Evento Sol
			query = "insert into CLIN_FAR_EVENTOSOLICITUD P ( SOLI_ID, CODEVENTO, FECHA, OBSERVACION, USUARIO, HDGCODIGO, ESACODIGO, CMECODIGO) values ("
			query = query + strconv.Itoa(PoSoliID)
			query = query + "," + strconv.Itoa(40)
			query = query + ", sysdate"
			query = query + "," + "'Actualiza despacho solicitud'"
			query = query + ",'" + PoUsuarioDe + "' "
			query = query + "," + strconv.Itoa(PHDGCodigo)
			query = query + "," + strconv.Itoa(PESACodigo)
			query = query + "," + strconv.Itoa(PCMECodigo) + ")"
			ctx = context.Background()
			rows, err := db.QueryContext(ctx, query)

			logger.Trace(logs.InformacionLog{Query: query, Mensaje: "Query evento actualiza despacho solicitud en despacho solicitud bodega"})

			if err != nil {
				logger.Error(logs.InformacionLog{
					Query:   query,
					Mensaje: "Se cayo query evento actualiza despacho solicitud en despacho solicitud bodega",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			defer rows.Close()

			if Consumo == "S" {
				query = "update clin_far_solicitudes"
				query = query + " set soli_estado = 60"
				query = query + " Where soli_id = " + strconv.Itoa(PoSoliID)
				ctx := context.Background()
				resupdsol, err := db.QueryContext(ctx, query)

				logger.Trace(logs.InformacionLog{Query: query, Mensaje: "Query actualizar estado solicitud a 60 en despacho solicitud bodega"})

				if err != nil {
					logger.Error(logs.InformacionLog{
						Query:   query,
						Mensaje: "Se cayo query actualizar estado solicitud a 60 en despacho solicitud bodega",
						Error:   err,
					})
					http.Error(w, err.Error(), http.StatusInternalServerError)
					return
				}
				defer resupdsol.Close()

				// Evento Sol
				query = "insert into CLIN_FAR_EVENTOSOLICITUD ( SOLI_ID, CODEVENTO, FECHA, OBSERVACION, USUARIO, HDGCODIGO, ESACODIGO, CMECODIGO) values ("
				query = query + strconv.Itoa(PoSoliID)
				query = query + "," + strconv.Itoa(60)
				query = query + ", sysdate"
				query = query + "," + "'Actualiza recepcion solicitud'"
				query = query + ",'" + PoUsuarioDe + "' "
				query = query + "," + strconv.Itoa(PHDGCodigo)
				query = query + "," + strconv.Itoa(PESACodigo)
				query = query + "," + strconv.Itoa(PCMECodigo) + ")"
				ctx = context.Background()
				rows, err := db.QueryContext(ctx, query)

				logger.Trace(logs.InformacionLog{Query: query, Mensaje: "Query evento actualiza recepcion solicitud en despacho solicitud bodega"})

				if err != nil {
					logger.Error(logs.InformacionLog{
						Query:   query,
						Mensaje: "Se cayo query evento actualiza recepcion solicitud en despacho solicitud bodega",
						Error:   err,
					})
					http.Error(w, err.Error(), http.StatusInternalServerError)
					return
				}
				defer rows.Close()
			}
		}

		if DespachaTotal == "0" {
			query = "update clin_far_solicitudes"
			query = query + " set soli_estado = 50"
			query = query + " Where soli_id =" + strconv.Itoa(PoSoliID)
			ctx := context.Background()
			resupdsol, err := db.QueryContext(ctx, query)

			logger.Trace(logs.InformacionLog{Query: query, Mensaje: "Query actualiza estado solicitud a 50 en despacho solicitud bodega"})

			if err != nil {
				logger.Error(logs.InformacionLog{
					Query:   query,
					Mensaje: "Se cayo query actualiza estado solicitud a 50 en despacho solicitud bodega",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			defer resupdsol.Close()

			//Evento Sol
			query = "insert into CLIN_FAR_EVENTOSOLICITUD ( SOLI_ID, CODEVENTO, FECHA, OBSERVACION, USUARIO, HDGCODIGO, ESACODIGO, CMECODIGO) values ("
			query = query + strconv.Itoa(PoSoliID)
			query = query + "," + strconv.Itoa(50)
			query = query + ", sysdate"
			query = query + "," + "'Actualiza despacho solicitud /completada'"
			query = query + ",'" + PoUsuarioDe + "' "
			query = query + "," + strconv.Itoa(PHDGCodigo)
			query = query + "," + strconv.Itoa(PESACodigo)
			query = query + "," + strconv.Itoa(PCMECodigo) + ")"
			ctx = context.Background()
			rows, err := db.QueryContext(ctx, query)

			logger.Trace(logs.InformacionLog{Query: query, Mensaje: "Query crear evento actualiza despacho solicitud completada en despacho solicitud bodega"})

			if err != nil {
				logger.Error(logs.InformacionLog{
					Query:   query,
					Mensaje: "Se cayo query crear evento actualiza despacho solicitud completada en despacho solicitud bodega",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			defer rows.Close()

			if Consumo == "S" {
				query = "update clin_far_solicitudes"
				query = query + " set soli_estado = 70"
				query = query + " Where soli_id = " + strconv.Itoa(PoSoliID)
				query = query + " AND HDGCODIGO =" + strconv.Itoa(PHDGCodigo)
				query = query + " AND ESACODIGO =" + strconv.Itoa(PESACodigo)
				query = query + " AND CMECODIGO =" + strconv.Itoa(PCMECodigo)
				ctx := context.Background()
				resupdsol, err := db.QueryContext(ctx, query)

				logger.Trace(logs.InformacionLog{Query: query, Mensaje: "Query actualizar estado solicitud a 70 en despacho solicitud bodega"})

				if err != nil {
					logger.Error(logs.InformacionLog{
						Query:   query,
						Mensaje: "Se cayo query actualizar estado solicitud a 70 en despacho solicitud bodega",
						Error:   err,
					})
					http.Error(w, err.Error(), http.StatusInternalServerError)
					return
				}
				defer resupdsol.Close()

				// Evento Sol
				query = "insert into CLIN_FAR_EVENTOSOLICITUD ( SOLI_ID, CODEVENTO, FECHA, OBSERVACION, USUARIO, HDGCODIGO, ESACODIGO, CMECODIGO) values ("
				query = query + strconv.Itoa(PoSoliID)
				query = query + "," + strconv.Itoa(70)
				query = query + ", sysdate"
				query = query + "," + "'Actualiza recepcion solicitud'"
				query = query + ",'" + PoUsuarioDe + "' "
				query = query + "," + strconv.Itoa(PHDGCodigo)
				query = query + "," + strconv.Itoa(PESACodigo)
				query = query + "," + strconv.Itoa(PCMECodigo) + ")"
				ctx = context.Background()
				rows, err := db.QueryContext(ctx, query)

				logger.Trace(logs.InformacionLog{Query: query, Mensaje: "Query insertar evento actualiza recepcion solicitud en despacho solicitud bodega"})

				if err != nil {
					logger.Error(logs.InformacionLog{
						Query:   query,
						Mensaje: "Se cayo query insertar evento actualiza recepcion solicitud en despacho solicitud bodega",
						Error:   err,
					})
					http.Error(w, err.Error(), http.StatusInternalServerError)
					return
				}
				defer rows.Close()
			}
		}
	}

	// Input data.
	FOLIO := 0
	SobreGiro := false

	var param models.ParamFin700Movimiento
	param.HdgCodigo = PHDGCodigo
	param.TipoMovimiento = 100
	param.IDAgrupador = IDAgrupador
	param.NumeroMovimiento = 0
	param.SoliID = PoSoliID
	param.Servidor = PoServidor
	param.Usuario = PoUsuarioDe
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
