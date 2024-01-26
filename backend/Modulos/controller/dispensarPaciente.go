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

// DispensarPaciente is...
func DispensarPaciente(w http.ResponseWriter, r *http.Request) {
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
	var PoCliID int
	var PoUniServID int
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
	var VMfdeID int
	var NuevoIDMFDe int
	var RECENUMERO int
	var RECETIPO string
	var RECEID int
	var CODCOBROINCLUIDO int
	var CODTIPIDENTIFICACION int
	var NUMIDENTIFICACIONRETIRA string
	var NOMBRESRETIRA string
	var operacion int

	models.EnableCors(&w)
	det := res.Detalle
	// DATOS CABECERA SOLICITUD
	for i := range det {
		PHDGCodigo = det[i].HDGCodigo
		PESACodigo = det[i].ESACodigo
		PCMECodigo = det[i].CMECodigo
		PoEstID = det[i].EstID
		PoCtaID = det[i].CtaID
		PoSoliID = det[i].SoliID
		PoServidor = det[i].Servidor
		PoCantADesp = det[i].CantADespachar
		PoCantDespa = det[i].CantDespachada
		PoCanDevo = det[i].CantDevo
		PoCantSoli = det[i].CantSoli
		PoUsuarioDe = det[i].UsuarioDespacha
		PoCliID = det[i].CliID
		PoUniServID = det[i].CodServicioOri
		BodOrigen = det[i].BodOrigen
		BodDestino = det[i].BodDestino
		RECENUMERO = det[i].RECENUMERO
		RECETIPO = det[i].RECETIPO
		RECEID = det[i].RECEID
		CODCOBROINCLUIDO = det[i].CODCOBROINCLUIDO
		CODTIPIDENTIFICACION = det[i].CODTIPIDENTIFICACIONRETIRA
		NUMIDENTIFICACIONRETIRA = det[i].NUMIDENTIFICACIONRETIRA
		NOMBRESRETIRA = det[i].NOMBRESRETIRA

		SumaSoli = SumaSoli + PoCantSoli
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

	MovfID = validar

	db, _ := database.GetConnection(PoServidor)

	// Se busca el ambito de la estadia o cuenta
	query = "select SOLI_CODAMBITO from clin_far_solicitudes "
	query = query + "where  soli_id  = " + strconv.Itoa(PoSoliID)

	ctx := context.Background()
	rows, err := db.QueryContext(ctx, query)

	logger.Trace(logs.InformacionLog{Query: query, Mensaje: "Query buscar ambito en cuenta"})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query buscar ambito en cuenta",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var CODAMBITO int

	for rows.Next() {
		err := rows.Scan(&CODAMBITO)
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan buscar ambito en cuenta",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}

	if CODAMBITO == 1 || CODAMBITO == 0 {
		operacion = 150
	}
	if CODAMBITO == 2 {
		operacion = 160
	}

	if CODAMBITO == 3 {
		operacion = 140
	}

	IDAgrupador, err := GeneraSecidAgrupador(PoServidor)
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "Fallo GeneraSecidAgrupador",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// CABECERA MOVIMIENTOS
	if validar == 0 {
		query = "INSERT INTO clin_far_movim ( MOVF_TIPO, HDGCODIGO, ESACODIGO, CMECODIGO, MOVF_FECHA, MOVF_USUARIO, MOVF_SOLI_ID,MOVF_BOD_ORIGEN"
		query = query + "	, MOVF_BOD_DESTINO, MOVF_ESTID, MOVF_CTA_ID, MOVF_CANTIDAD, MOVF_Valor_Total, MOVF_RUT_PACIENTE, MOVF_FECHA_GRABACION, MOVF_CLIID"
		query = query + "	, MOVF_SERV_ID_CARGO, MOVF_RECETA, MOVF_RECE_TIPO, MOVF_RECE_ID,INT_ERP_ESTADO)"
		query = query + "values ( " + strconv.Itoa(operacion)
		query = query + " ," + strconv.Itoa(PHDGCodigo)
		query = query + " ," + strconv.Itoa(PESACodigo)
		query = query + " ," + strconv.Itoa(PCMECodigo)
		query = query + " , sysdate "
		query = query + " ,'" + PoUsuarioDe + "'"
		query = query + " ," + strconv.Itoa(PoSoliID)
		query = query + " ," + strconv.Itoa(BodOrigen)
		query = query + " ," + strconv.Itoa(BodDestino)
		query = query + " ," + strconv.Itoa(PoEstID)
		query = query + " ," + strconv.Itoa(PoCtaID)
		query = query + " ," + strconv.Itoa(SumaSoli)
		query = query + " ," + strconv.FormatFloat(ValTotal, 'g', 1, 64)
		query = query + " ,''"
		query = query + " , sysdate "
		query = query + " ," + strconv.Itoa(PoCliID)
		query = query + " ," + strconv.Itoa(PoUniServID)
		query = query + " ," + strconv.Itoa(RECENUMERO)
		query = query + " ,'" + RECETIPO + "'"
		query = query + " ," + strconv.Itoa(RECEID)
		query = query + " , 'PENDIENTE' "
		query = query + " )"

		ctx := context.Background()
		rows, err := db.QueryContext(ctx, query)

		logger.Trace(logs.InformacionLog{Query: query, Mensaje: "Query cabecera dispensar paciente"})

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   query,
				Mensaje: "Se cayo query cabecera dispensar paciente",
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
	qryUpd3 := ""
	qryIns1 := ""
	qryIns2 := ""
	qryIns3 := ""
	transaccion := 0
	query = ""
	//-------------------------------------------------------------------------
	// DETALLE  SOLICITUD
	for i := range det {
		qryUpd1 = ""
		qryUpd2 = ""
		qryUpd3 = ""
		qryIns1 = ""
		qryIns2 = ""
		qryIns3 = ""
		transaccion = 1
		var estReceta string

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
				qryUpd1 = qryUpd1 + " ,Sode_Estado = 40"
				qryUpd1 = qryUpd1 + " ,Sode_Observaciones = '" + PoObservaci + "'"
				qryUpd1 = qryUpd1 + " ,SODE_LOTE = '" + det[i].Lote + "'"
				qryUpd1 = qryUpd1 + " ,SODE_LOTE_FECHAVTO = to_date('" + det[i].FechaVto + "','DD-MM-YYYY')"
				qryUpd1 = qryUpd1 + " Where sode_id = " + strconv.Itoa(PoSodeID)
				qryUpd1 = qryUpd1 + " And sode_soli_id = " + strconv.Itoa(PoSoliID)
				qryUpd1 = qryUpd1 + ";"

				estReceta = "PE"

				// Evento Det Sol
				qryIns1 = qryIns1 + " insert into CLIN_FAR_DETEVENTOSOLICITUD (SODE_ID, SOLI_ID, CODEVENTO, FECHA, OBSERVACION, CANTIDAD, USUARIO, LOTE, FECHAVTO) values ("
				qryIns1 = qryIns1 + strconv.Itoa(PoSodeID)
				qryIns1 = qryIns1 + ", " + strconv.Itoa(PoSoliID)
				qryIns1 = qryIns1 + ", " + strconv.Itoa(40)
				qryIns1 = qryIns1 + ", sysdate"
				qryIns1 = qryIns1 + ", " + "'Actualiza detalle solicitud despacho parcial'"
				qryIns1 = qryIns1 + ", " + strconv.Itoa(PoCantADesp)
				qryIns1 = qryIns1 + ", '" + PoUsuarioDe + "'"
				qryIns1 = qryIns1 + ", '" + det[i].Lote + "'"
				qryIns1 = qryIns1 + ", to_date('" + det[i].FechaVto + "','DD-MM-YYYY') )"
				qryIns1 = qryIns1 + ";"
				//log.Println("qry (dispensarpaciente) : ", query)

			}

			if VaCanSuma == PoCantSoli {
				qryUpd1 = qryUpd1 + " update clin_far_solicitudes_det"
				qryUpd1 = qryUpd1 + " set sode_cant_desp = (nvl(sode_cant_desp,0) + " + strconv.Itoa(PoCantADesp) + ")"
				qryUpd1 = qryUpd1 + " ,Sode_Estado = 50"
				qryUpd1 = qryUpd1 + " ,Sode_Observaciones = '" + PoObservaci + "'"
				qryUpd1 = qryUpd1 + " ,SODE_LOTE = '" + det[i].Lote + "'"
				qryUpd1 = qryUpd1 + " ,SODE_LOTE_FECHAVTO = to_date('" + det[i].FechaVto + "','DD-MM-YYYY')"
				qryUpd1 = qryUpd1 + " Where sode_id = " + strconv.Itoa(PoSodeID)
				qryUpd1 = qryUpd1 + " And sode_soli_id = " + strconv.Itoa(PoSoliID)
				qryUpd1 = qryUpd1 + ";"
				//log.Println("qry (dispensarpaciente) : ", query)

				estReceta = "FI"

				//Evento Det Sol
				qryIns1 = qryIns1 + " insert into CLIN_FAR_DETEVENTOSOLICITUD (SODE_ID, SOLI_ID, CODEVENTO, FECHA, OBSERVACION, CANTIDAD, USUARIO, LOTE, FECHAVTO) values ("
				qryIns1 = qryIns1 + strconv.Itoa(PoSodeID)
				qryIns1 = qryIns1 + ", " + strconv.Itoa(PoSoliID)
				qryIns1 = qryIns1 + ", " + strconv.Itoa(50)
				qryIns1 = qryIns1 + ", sysdate"
				qryIns1 = qryIns1 + ", " + "'Actualiza detalle solicitud despacho total'"
				qryIns1 = qryIns1 + ", " + strconv.Itoa(PoCantADesp)
				qryIns1 = qryIns1 + ", '" + PoUsuarioDe + "'"
				qryIns1 = qryIns1 + ", '" + det[i].Lote + "'"
				qryIns1 = qryIns1 + ", to_date('" + det[i].FechaVto + "','DD-MM-YYYY')"
				qryIns1 = qryIns1 + ");"
				//log.Println("qry (dispensarpaciente) : ", query)

			}
			//log.Println("VALIDARMOVIMIENTO")
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

			qryIns2 = qryIns2 + " insert into clin_far_movimdet (mfde_id, mfde_movf_id, mfde_fecha, mfde_tipo_mov, mfde_mein_codmei"
			qryIns2 = qryIns2 + ", mfde_mein_id, mfde_cantidad, mfde_valor_costo_unitario, mfde_valor_venta_unitario, mfde_unidad_compra"
			qryIns2 = qryIns2 + ", mfde_unidad_despacho, mfde_ctas_id, mfde_incob_fonasa, mfde_lote, mfde_lote_fechavto, MFDE_SOLI_ID,INT_CARGO_ESTADO, MFDE_AGRUPADOR_ID, INT_ERP_ESTADO ) values ( "
			qryIns2 = qryIns2 + strconv.Itoa(VMfdeID)
			qryIns2 = qryIns2 + ", " + strconv.Itoa(MovfID)
			qryIns2 = qryIns2 + ", sysdate"
			qryIns2 = qryIns2 + ", " + strconv.Itoa(operacion)
			qryIns2 = qryIns2 + ", '" + PoCodMei + "'"
			qryIns2 = qryIns2 + ", " + strconv.Itoa(PoMeInID)
			qryIns2 = qryIns2 + ", " + strconv.Itoa(PoCantADesp)
			qryIns2 = qryIns2 + ", " + strconv.FormatFloat(PoValCos, 'g', 1, 64)
			qryIns2 = qryIns2 + ", " + strconv.Itoa(PoValVen)
			qryIns2 = qryIns2 + ", " + strconv.Itoa(PoUniCompr)
			qryIns2 = qryIns2 + ", " + strconv.Itoa(PoUniDespa)
			qryIns2 = qryIns2 + ", " + strconv.Itoa(PoCtaID)
			qryIns2 = qryIns2 + ", '" + PoIncFon + "'"
			qryIns2 = qryIns2 + ", '" + det[i].Lote + "'"
			qryIns2 = qryIns2 + ", to_date('" + det[i].FechaVto + "','DD-MM-YYYY') "
			qryIns2 = qryIns2 + ", " + strconv.Itoa(PoSoliID)
			qryIns2 = qryIns2 + ",'PENDIENTE'"
			qryIns2 = qryIns2 + ", " + strconv.Itoa(IDAgrupador)
			qryIns2 = qryIns2 + ",'PENDIENTE'"
			qryIns2 = qryIns2 + " );"

			//log.Println("qryIns2 (dispensarpaciente) : ", qryIns2)

			//Actualiza stock BODEGAS_INV
			qryUpd2 = qryUpd2 + " UPDATE CLIN_FAR_BODEGAS_INV "
			qryUpd2 = qryUpd2 + " SET FBOI_STOCK_ACTUAL  = (nvl(FBOI_STOCK_ACTUAL ,0) - " + strconv.Itoa(PoCantADesp) + ")"
			qryUpd2 = qryUpd2 + " WHERE FBOI_FBOD_CODIGO  = " + strconv.Itoa(BodDestino)
			qryUpd2 = qryUpd2 + " AND FBOI_MEIN_ID  = " + strconv.Itoa(PoMeInID)
			qryUpd2 = qryUpd2 + ";"

			DescripcionMov, err := BuscaTipoMovim(operacion, PoServidor)
			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo busca tipo movimiento",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			// Registra en Kardex
			qryIns3 = qryIns3 + " insert into CLIN_FAR_KARDEX (KARD_ID, KARD_MEIN_ID, KARD_MEIN_CODMEI, KARD_FECHA, KARD_CANTIDAD, KARD_OPERACION, KARD_BOD_ORIGEN, KARD_BOD_DESTINO, KARD_MFDE_ID, KARD_DESCRIPCION) values ( CLIN_KARD_SEQ.NEXTVAL, "
			qryIns3 = qryIns3 + strconv.Itoa(PoMeInID)
			qryIns3 = qryIns3 + ", '" + PoCodMei + "'"
			qryIns3 = qryIns3 + ", sysdate"
			qryIns3 = qryIns3 + ", " + strconv.Itoa(PoCantADesp)
			qryIns3 = qryIns3 + ", 'R'"
			qryIns3 = qryIns3 + ", " + strconv.Itoa(BodOrigen)
			qryIns3 = qryIns3 + ", " + strconv.Itoa(BodDestino)
			qryIns3 = qryIns3 + ", " + strconv.Itoa(VMfdeID)
			qryIns3 = qryIns3 + ", '" + DescripcionMov + "' )"
			qryIns3 = qryIns3 + ";"

			if RECEID != 0 {
				if CODTIPIDENTIFICACION != 0 {
					qryUpd3 = qryUpd3 + " UPDATE CLIN_FAR_RECETAS "
					qryUpd3 = qryUpd3 + " SET RECE_COD_COBRO_INCLUIDO = " + strconv.Itoa(CODCOBROINCLUIDO)
					qryUpd3 = qryUpd3 + " , RECE_CODTIPIDENTIFICACION_RETIRA  = " + strconv.Itoa(CODTIPIDENTIFICACION)
					qryUpd3 = qryUpd3 + " , RECE_NUMIDENTIFICACION_RETIRA = '" + NUMIDENTIFICACIONRETIRA + "'"
					qryUpd3 = qryUpd3 + " , RECE_NOMBRES_RETIRA  = '" + NOMBRESRETIRA + "'"
					qryUpd3 = qryUpd3 + " WHERE RECE_ID  = " + strconv.Itoa(RECEID)
					qryUpd3 = qryUpd3 + ";"
				} else {
					qryUpd3 = qryUpd3 + " UPDATE CLIN_FAR_RECETAS "
					qryUpd3 = qryUpd3 + " SET RECE_COD_COBRO_INCLUIDO = " + strconv.Itoa(CODCOBROINCLUIDO)
					qryUpd3 = qryUpd3 + " WHERE RECE_ID  = " + strconv.Itoa(RECEID)
					qryUpd3 = qryUpd3 + ";"
				}

				//Actualiza detalle Receta
				qryUpd3 = qryUpd3 + " UPDATE clin_far_recetasdet "
				qryUpd3 = qryUpd3 + " SET rede_cantidad_adesp  = " + strconv.Itoa(PoCantADesp)
				qryUpd3 = qryUpd3 + " , CANTIDAD_PAGADA_CAJA =nvl(CANTIDAD_PAGADA_CAJA, 0 ) - " + strconv.Itoa(PoCantADesp)
				qryUpd3 = qryUpd3 + " , rede_estado_producto  = UPPER('" + estReceta + "')"
				qryUpd3 = qryUpd3 + " WHERE rece_id  = " + strconv.Itoa(RECEID)
				qryUpd3 = qryUpd3 + " AND rede_mein_codmei  = '" + PoCodMei + "'"
				qryUpd3 = qryUpd3 + ";"
			}

		}

		query = query + qryUpd1 + qryIns1 + qryIns2 + qryUpd2 + qryIns3 + qryUpd3
	}

	//-------------------------------------------------------------------------
	if transaccion == 1 {
		query = "BEGIN " + query + " END;"
		ctx := context.Background()

		rowsT, err := db.QueryContext(ctx, query)

		logger.Trace(logs.InformacionLog{Query: query, Mensaje: "Query transaccion dispensar paciente"})

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   query,
				Mensaje: "Se cayo query transaccion dispensar paciente",
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
	query = query + " from (select SODE_CANT_SOLI,SODE_CANT_DESP ,(case when SODE_CANT_SOLI > SODE_CANT_DESP then 1  else 0 end ) despachado_parcial "
	query = query + " from clin_far_solicitudes_det where sode_soli_id =" + strconv.Itoa(PoSoliID)
	query = query + " and SODE_ESTADO <> 110)"

	ctx = context.Background()
	//log.Println("qry (dispensarpaciente) :", query)
	rowstipodespacho, err := db.QueryContext(ctx, query)

	logger.Trace(logs.InformacionLog{Query: query, Mensaje: "Query suma despachado parcial dispensar paciente"})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query suma despachado parcial dispensar paciente",
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
				Mensaje: "Se cayo scan suma despachado parcial dispensar paciente",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		DespachaTotal = strVal1
		ind = ind + 1
	}
	defer rowstipodespacho.Close()

	//log.Println("*(dispensarpaciente).....DespachaTotal :", DespachaTotal)

	if DespachaTotal != "0" {
		query = " update clin_far_solicitudes"
		query = query + " set soli_estado = 40"
		query = query + " Where soli_id = " + strconv.Itoa(PoSoliID)
		//log.Println("qry (dispensarpaciente) : ", query)
		ctx := context.Background()
		resupdsol, err := db.QueryContext(ctx, query)

		logger.Trace(logs.InformacionLog{Query: query, Mensaje: "Query actualizar estado a 40 en dispensar paciente"})

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   query,
				Mensaje: "Se cayo query actualizar estado a 40 en dispensar paciente",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer resupdsol.Close()

		// Evento Sol
		query = "insert into CLIN_FAR_EVENTOSOLICITUD ( SOLI_ID, CODEVENTO, FECHA, OBSERVACION, USUARIO) values ("
		query = query + strconv.Itoa(PoSoliID)
		query = query + "," + strconv.Itoa(40)
		query = query + ", sysdate"
		query = query + "," + "'Agrega dispensar paciente'"
		query = query + ",'" + PoUsuarioDe + "' )"
		//log.Println("qry (dispensarpaciente) : ", query)
		ctx = context.Background()
		rows, err := db.QueryContext(ctx, query)

		logger.Trace(logs.InformacionLog{Query: query, Mensaje: "Query crear evento agrega dispensar paciente"})

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   query,
				Mensaje: "Se cayo query crear evento agrega dispensar paciente",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		if RECEID != 0 {
			// receta
			query = " UPDATE clin_far_recetas"
			query = query + " SET rece_estado_receta = 'PE' "
			query = query + " , rece_sol_id = " + strconv.Itoa(PoSoliID)
			query = query + " , rece_estado_despacho = 40 "
			query = query + " WHERE  rece_id = " + strconv.Itoa(RECEID)
			query = query + " AND hdgcodigo = " + strconv.Itoa(PHDGCodigo)
			query = query + " AND esacodigo = " + strconv.Itoa(PESACodigo)
			query = query + " AND cmecodigo = " + strconv.Itoa(PCMECodigo)

			//log.Println("qry (dispensarpaciente) : ", query)
			ctx := context.Background()
			resupdrece, err := db.QueryContext(ctx, query)

			logger.Trace(logs.InformacionLog{Query: query, Mensaje: "Query actualizar estado solicitud a 40 en dispensar paciente"})

			if err != nil {
				logger.Error(logs.InformacionLog{
					Query:   query,
					Mensaje: "Se cayo query actualizar estado solicitud a 40 en dispensar paciente",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			defer resupdrece.Close()
		}
	}

	if DespachaTotal == "0" {
		query = "update clin_far_solicitudes"
		query = query + " set soli_estado = 50"
		query = query + " Where soli_id = " + strconv.Itoa(PoSoliID)
		//log.Println("qry (dispensarpaciente) : ", query)
		ctx := context.Background()
		resupdsol, err := db.QueryContext(ctx, query)
		logger.Trace(logs.InformacionLog{Query: query, Mensaje: "Query actualizar estado solicitud a 50 en dispensar paciente"})

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   query,
				Mensaje: "Se cayo query actualizar estado solicitud a 50 en dispensar paciente",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer resupdsol.Close()

		// Evento Sol
		query = "insert into CLIN_FAR_EVENTOSOLICITUD ( SOLI_ID, CODEVENTO, FECHA, OBSERVACION, USUARIO) values ("
		query = query + strconv.Itoa(PoSoliID)
		query = query + "," + strconv.Itoa(50)
		query = query + ", sysdate"
		query = query + "," + "'Actualiza dispensar paciente'"
		query = query + ",'" + PoUsuarioDe + "' )"
		//log.Println("qry (dispensarpaciente) : ", query)
		ctx = context.Background()
		rows, err := db.QueryContext(ctx, query)

		logger.Trace(logs.InformacionLog{Query: query, Mensaje: "Query crear evento actualiza dispensar paciente"})

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   query,
				Mensaje: "Se cayo query crear evento actualiza dispensar paciente",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		if RECEID != 0 {
			// receta
			query = " UPDATE clin_far_recetas"
			query = query + " SET rece_estado_receta = 'FI' "
			query = query + " , rece_sol_id = " + strconv.Itoa(PoSoliID)
			query = query + " , rece_estado_despacho = 50 "
			query = query + " WHERE  rece_id = " + strconv.Itoa(RECEID)
			query = query + " AND hdgcodigo = " + strconv.Itoa(PHDGCodigo)
			query = query + " AND esacodigo = " + strconv.Itoa(PESACodigo)
			query = query + " AND cmecodigo = " + strconv.Itoa(PCMECodigo)

			ctx := context.Background()
			resupdrece, err := db.QueryContext(ctx, query)

			logger.Trace(logs.InformacionLog{Query: query, Mensaje: "Query actualizar estado receta a FI en dispensar paciente"})

			if err != nil {
				logger.Error(logs.InformacionLog{
					Query:   query,
					Mensaje: "Se cayo query actualizar estado receta a FI en dispensar paciente",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			defer resupdrece.Close()
		}
	}

	//defer db.Close()
	if RECEID != 0 {
		go LlamadaInterfazDespachoRecetaLegado(PHDGCodigo, PoServidor, RECEID, 0)
	}

	models.EnableCors(&w)

	// Input data.
	var valores models.RespuestaGrabacion
	valores.Respuesta = "OK"
	SobreGiro := false
	FOLIO := 0

	var param models.ParamFin700Movimiento
	param.HdgCodigo = PHDGCodigo
	param.TipoMovimiento = operacion
	param.IDAgrupador = IDAgrupador
	param.NumeroMovimiento = 0
	param.SoliID = PoSoliID
	param.Servidor = PoServidor
	param.Usuario = PoUsuarioDe
	param.SobreGiro = SobreGiro
	param.IntegraFin700, _ = paramg.ObtenerClinFarParamGeneral(db, "intFin700")
	param.IntegraSisalud, _ = paramg.ObtenerClinFarParamGeneral(db, "intSisalud")
	param.DB = db

	if param.IntegraFin700 == "SI" {
		FOLIO = EnviarmovimientosFin702(param)
		logger.Trace(logs.InformacionLog{
			Mensaje:  "Envio exitoso FIN 702",
			Contexto: map[string]interface{}{"folio": FOLIO},
		})
	}

	logger.Info(logs.InformacionLog{Mensaje: "FOLIO : " + strconv.Itoa(FOLIO)})

	if param.IntegraSisalud == "SI" {
		if CODAMBITO != 1 {
			go EnviacargosSisalud(PHDGCodigo, MovfID, 0, PoServidor, 0)
		}
	}

	var retornoValores models.RespuestaGrabacion = valores
	json.NewEncoder(w).Encode(retornoValores)
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
