package controller

import (
	"bytes"
	"context"
	"database/sql"
	"database/sql/driver"
	"encoding/json"
	"encoding/xml"
	"fmt"
	ioutil "io"
	"net/http"
	"strconv"

	. "github.com/godror/godror"

	"sonda.com/logistico/Modulos/comun"
	paramg "sonda.com/logistico/Modulos/comun"
	"sonda.com/logistico/Modulos/models"
	logs "sonda.com/logistico/logging"
)

// EnviarmovimientosFin702 is...
func EnviarmovimientosFin702(res models.ParamFin700Movimiento) int {
	xmlLogger := logs.ObtenerLogger(logs.Fin700Logger)
	xmlLogger.LoguearEntrada()

	var xmlLlamada models.EnvelopeLlamado
	var xmlDetAux models.LineaDetalle
	var xmlDetFisicoAux models.LineaFisico
	FOLIO := 0

	db := res.DB

	var url string // "http://10.211.30.25/fin700testws/wsLogIntegraOperacion/wsLogIntegraOperacion.asmx?wsdl"
	queryURL := " select fpar_valor from clin_far_param where fpar_tipo = 80 and fpar_codigo = 1 and fpar_estado = 0"
	ctxURL := context.Background()
	rowsURL, errURL := db.QueryContext(ctxURL, queryURL)

	xmlLogger.Trace(logs.InformacionLog{
		Query:   queryURL,
		Mensaje: "Query obtener URL de wsLogIntegraPedido",
	})

	if errURL != nil {
		xmlLogger.Error(logs.InformacionLog{
			Query:   queryURL,
			Mensaje: "Se cayo query obtener URL de wsLogIntegraPedido",
			Error:   errURL,
		})
		return FOLIO
	}
	defer rowsURL.Close()

	if rowsURL != nil {
		for rowsURL.Next() {
			errURL := rowsURL.Scan(&url)
			if errURL != nil {
				xmlLogger.Error(logs.InformacionLog{
					Mensaje: "Se cayo scan obtener URL de wsLogIntegraPedido",
					Error:   errURL,
				})
				return FOLIO
			}
		}
	}

	inNumeromovimiento := res.NumeroMovimiento
	ctx := context.Background()

	var response *sql.Rows
	valor, err := comun.ObtenerClinFarParamGeneral(db, "usaPCKGEnvMovFin702")
	if err != nil {
		xmlLogger.Error(logs.InformacionLog{
			Mensaje: "Error al obtener el valor del parametro",
			Error:   err,
		})
		return FOLIO
	}

	if valor == "SI" {
		var rows driver.Rows
		SRV_MESSAGE := "100000"
		jsonEntrada, _ := json.Marshal(res)
		In_Json := string(jsonEntrada)
		xmlLogger.Trace(logs.InformacionLog{Mensaje: "Entro en la solucion EnviarmovimientosFin702"})

		transaction, err := db.Begin()
		if err != nil {
			xmlLogger.Error(logs.InformacionLog{
				Mensaje: "No puede crear transaccion para devolver enviar movimientos fin 702",
				Error:   err,
			})
			return FOLIO
		}

		qry := "BEGIN PKG_MOVIMIENTOS_FIN702.P_MOVIMIENTOS_FIN702(:1,:2,:3); END;"

		xmlLogger.Trace(logs.InformacionLog{
			Query:   qry,
			Mensaje: "Ejecucion Package EnviarmovimientosFin702",
		})

		_, err = transaction.Exec(qry,
			PlSQLArrays,
			sql.Out{Dest: &SRV_MESSAGE}, // :1
			In_Json,                     // :2
			sql.Out{Dest: &rows},        // :3
		)

		if err != nil {
			xmlLogger.Error(logs.InformacionLog{
				Query:   qry,
				Mensaje: "Fallo package enviar movimientos fin 702",
				Error:   err,
			})

			errRollback := transaction.Rollback()
			if errRollback != nil {
				xmlLogger.Error(logs.InformacionLog{
					Mensaje: "Se cayo rollback package enviar movimientos fin 702",
					Error:   errRollback,
				})
			}
			return FOLIO
		}
		if SRV_MESSAGE != "1000000" {
			defer transaction.Rollback()
			xmlLogger.Trace(logs.InformacionLog{
				Mensaje: "Rollback de enviar movimientos fin 702" + SRV_MESSAGE,
				Error:   err,
			})

			return FOLIO
		}

		defer rows.Close()

		response, err = WrapRows(ctx, db, rows)
		if err != nil {
			xmlLogger.Error(logs.InformacionLog{
				Mensaje: "Se cayo wrap rows",
				Error:   err,
			})
			return FOLIO
		}

		defer response.Close()
	} else {

		query := " SELECT   "
		query = query + "     nvl(cab.esacodigo, 0) AS Empresa  "
		query = query + "    ,nvl(cab.hdgcodigo, 0) AS Division  "
		query = query + "    ,1 AS Unidad  "
		// query = query + "    ,nvl(cab.cmecodigo, 0) AS Unidad  "
		query = query + "    ,nvl((select TO_CHAR(sysdate, 'YYYYMMDD') from dual), '19000101') AS fechaproceso "
		query = query + "    ,nvl((select bod.FBO_CODIGOBODEGA from clin_far_bodegas bod where bod.fbod_codigo = cab.movf_bod_origen), 0) AS BodegaOrigen "
		query = query + "    ,nvl((select bod.FBO_CODIGOBODEGA from clin_far_bodegas bod where bod.fbod_codigo = cab.movf_bod_destino), 0) AS BodegaDestino "
		query = query + "    ,nvl((select TO_CHAR(sysdate, 'YYYYMMDD') from dual) , '19000101') AS FechaDocumento "
		query = query + "    ,nvl(cab.movf_rece_id, 0) as ReceID "
		query = query + "    ,nvl(det.MFDE_REFERENCIA_CONTABLE, 0) as OperacionConsumoRef  "
		query = query + "	,nvl(rownum, 0) as Linea "
		query = query + "	 ,nvl(det.mfde_ctas_id, 0) as ctaID "
		query = query + "	,nvl(det.mfde_id, 0) as mdetID "
		query = query + "	 ,nvl(det.mfde_mein_id, 0) as ProductoID "
		query = query + "	,nvl(det.mfde_mein_codmei , '') as productocod  "
		query = query + "	,nvl(det.mfde_cantidad , 0) as cantidadstock  "
		query = query + "	,nvl(0 , 0) as cantidad2  "
		query = query + "	,nvl(0 , 0) as valortotal "
		query = query + "	,nvl(0 , 0) as conceptoimp "
		query = query + "	,nvl((select fpar_valor from clin_far_param where fpar_tipo = 66 and fpar_codigo = 1) , 0) as tipoproyecto  "
		query = query + "	,nvl((select fpar_valor from clin_far_param where fpar_tipo = 66 and fpar_codigo = 2) , 0) as numeroproyecto  "
		query = query + "	,nvl((select ubicacion_fin700 from clin_far_bodegas where fbod_codigo = cab.movf_bod_origen) , 0) as ubicacionO  "
		query = query + "	,nvl((select ubicacion_fin700 from clin_far_bodegas where fbod_codigo = cab.movf_bod_destino) , 0) as ubicacionD  "
		query = query + "	,nvl(det.mfde_lote , ' ') as numerolote  "
		query = query + "	,nvl(to_char(det.mfde_lote_fechavto, 'YYYYMMDD') , '19000101') as lotefecexpiracion  "
		query = query + "	,nvl(' ', ' ') as numeroserie  "
		query = query + "	,nvl(det.MFDE_TIPO_MOV, 0) AS Tipo "
		query = query + "   ,'NORMAL' as TipoMovim"
		query = query + "   ,nvl((select sol.soli_tipo_solicitud from clin_far_solicitudes sol "
		query = query + "    where sol.soli_id = cab.movf_soli_id), 0) as TipoSolicitud "
		query = query + "   ,nvl((select SOLI_OBSERVACIONES from clin_far_solicitudes where soli_id = cab.movf_soli_id), 'Sin Observacion') as GlosaOperacion"
		query = query + "   ,nvl((SELECT centroconsumo FROM glo_unidades_organizacionales WHERE esacodigo = cab.esacodigo AND cod_servicio = (select sol.SOLI_CODSERVICIOACTUAL from clin_far_solicitudes sol where sol.soli_id = cab.movf_soli_id)), 0) AS centroconsumo "
		query = query + "   ,nvl((SELECT unor_correlativo FROM glo_unidades_organizacionales WHERE esacodigo = cab.esacodigo AND cod_servicio =(select sol.SOLI_CODSERVICIOACTUAL from clin_far_solicitudes sol where sol.soli_id = cab.movf_soli_id)), 0) AS centrocosto "
		query = query + "   ,nvl((SELECT fpar_valor FROM clin_far_param WHERE fpar_tipo = 66 AND fpar_codigo = 3), 0) as UsuarioProceso"
		if res.SoliID != 0 {
			query = query + "   , NVL((SELECT COUNT(mfde_mein_codmei) "
			query = query + " FROM clin_far_movimdet where mfde_soli_id = cab.movf_soli_id "
			query = query + " AND (mfde_tipo_mov = det.mfde_tipo_mov or mfde_tipo_mov = det.mfde_tipo_mov * 10 ) "
			query = query + " AND mfde_mein_id = det.mfde_mein_id AND INT_ERP_ESTADO <> 'TRASPASADO' "
			if res.ReferenciaDesp > 0 {
				query = query + "     and MFDE_REF_DESPACHO = " + strconv.Itoa(res.ReferenciaDesp) + " "
			}
			query = query + " GROUP BY mfde_mein_codmei HAVING COUNT(mfde_mein_codmei) > 0), 0) AS CANT"
		} else {
			query = query + "   , NVL((SELECT COUNT(mfde_mein_codmei) FROM clin_far_movimdet WHERE mfde_agrupador_id = det.mfde_agrupador_id AND mfde_mein_id = det.mfde_mein_id AND int_erp_estado <> 'TRASPASADO' GROUP BY mfde_mein_codmei HAVING COUNT(mfde_mein_codmei) > 0), 0) AS CANT"
		}
		query = query + " , nvl(MFDE_REF_DESPACHO, 0) "
		query = query + " , det.mfde_agrupador_id || det.mfde_ref_despacho AS NroRefExterno "
		query = query + " FROM "
		query = query + "     clin_far_movim cab, "
		query = query + "     clin_far_movimdet det "
		query = query + " WHERE  "
		query = query + "        cab.movf_id = det.mfde_movf_id "
		query = query + "    and det.int_erp_estado <> 'TRASPASADO' AND det.int_erp_error <> 'EXITO' "
		if res.HdgCodigo != 0 {
			query = query + "    and cab.hdgcodigo = " + strconv.Itoa(res.HdgCodigo)
		}
		if res.CmeCodigo != 0 {
			query = query + "    and cab.cmecodigo = " + strconv.Itoa(res.CmeCodigo)
		}
		if res.EsaCodigo != 0 {
			query = query + "    and cab.esacodigo = " + strconv.Itoa(res.EsaCodigo)
		}
		if res.SoliID != 0 {
			query = query + " 	 and cab.movf_soli_id = " + strconv.Itoa(res.SoliID)
		}
		if res.TipoMovimiento > 0 {
			query = query + " 	 and det.MFDE_TIPO_MOV = " + strconv.Itoa(res.TipoMovimiento)
		}
		if res.IDAgrupador > 0 {
			query = query + "     and det.mfde_agrupador_id = " + strconv.Itoa(res.IDAgrupador) + " "
		}
		if res.ReferenciaDesp > 0 {
			query = query + "     and det.MFDE_REF_DESPACHO = " + strconv.Itoa(res.ReferenciaDesp) + " "
		}
		if res.NumeroMovimiento > 0 {
			query = query + "     and det.mfde_id = " + strconv.Itoa(res.NumeroMovimiento)
		}
		if res.SobreGiro {
			query = query + "     and det.int_erp_estado = 'PENDIENTE'"
		}
		query = query + " union "
		query = query + "SELECT  "
		query = query + "     nvl(cab.esacodigo, 0) AS Empresa  "
		query = query + "    ,nvl(cab.hdgcodigo, 0) AS Division  "
		query = query + "    ,1 AS Unidad  "
		//query = query + "    ,nvl(cab.cmecodigo, 0) AS Unidad  "
		query = query + "    ,nvl((select TO_CHAR(sysdate, 'YYYYMMDD') from dual), '19000101') AS fechaproceso "
		query = query + "    ,nvl((select bod.FBO_CODIGOBODEGA from clin_far_bodegas bod where bod.fbod_codigo = cab.movf_bod_origen), 0) AS BodegaOrigen "
		query = query + "    ,nvl((select bod.FBO_CODIGOBODEGA from clin_far_bodegas bod where bod.fbod_codigo = cab.movf_bod_destino), 0) AS BodegaDestino "
		query = query + "    ,nvl((select TO_CHAR(sysdate, 'YYYYMMDD') from dual) , '19000101') AS FechaDocumento "
		query = query + "    ,nvl(cab.movf_rece_id, 0) as ReceID "
		query = query + "    ,nvl(dev.mdev_referencia_contable, 0) as OperacionConsumoRef  "
		query = query + "    ,nvl(rownum, 0) as Linea "
		query = query + "	 ,nvl(dev.mdev_ctas_id, 0) as ctaID "
		query = query + "	 ,nvl(dev.mdev_id, 0) as mdetID "
		query = query + "	 ,nvl((select mfde_mein_id from clin_far_movimdet where mfde_id = dev.mdev_mfde_id), 0) as ProductoID "
		query = query + "    ,nvl((select det.mfde_mein_codmei from clin_far_movimdet det where mfde_id = dev.mdev_mfde_id), '') as ProductoCod  "
		query = query + " 	 ,nvl(dev.mdev_cantidad , 0) as CantidadStock  "
		query = query + " 	 ,nvl(0 , 0) as Cantidad2  "
		query = query + " 	 ,nvl(0 , 0) as ValorTotal  "
		query = query + " 	 ,nvl(0 , 0) as ConceptoImp  "
		query = query + " 	 ,nvl((select fpar_valor from clin_far_param where fpar_tipo = 66 and fpar_codigo = 1) , 0) as TipoProyecto  "
		query = query + " 	 ,nvl((select fpar_valor from clin_far_param where fpar_tipo = 66 and fpar_codigo = 2) , 0) as NumeroProyecto  "
		query = query + "	,nvl((select ubicacion_fin700 from clin_far_bodegas where fbod_codigo = cab.movf_bod_origen) , 0) as ubicacionO  "
		query = query + "	,nvl((select ubicacion_fin700 from clin_far_bodegas where fbod_codigo = cab.movf_bod_destino) , 0) as ubicacionD  "
		query = query + " 	 ,nvl(det.mfde_lote , ' ') as NumeroLote  "
		query = query + " 	 ,nvl(to_char(det.mfde_lote_fechavto, 'YYYYMMDD') , '19000101') as LoteFecExpiracion  "
		query = query + " 	 ,nvl(' ', ' ') as NumeroSerie  "
		query = query + "    ,nvl(dev.mdev_movf_tipo, 0) AS Tipo "
		query = query + "    ,'DEVOLUCION' as TipoMovim"
		query = query + "   ,nvl((select sol.soli_tipo_solicitud from clin_far_solicitudes sol "
		query = query + "    	  where sol.SOLI_ID = MOVF_SOLI_ID), 0) as TIPO_SOLICITUD "
		query = query + "   ,nvl((select SOLI_OBSERVACIONES from clin_far_solicitudes where soli_id = cab.movf_soli_id), 'Sin Observacion') as GlosaOperacion"
		query = query + "   ,nvl((SELECT centroconsumo FROM glo_unidades_organizacionales WHERE esacodigo = cab.esacodigo AND cod_servicio = (select sol.SOLI_CODSERVICIOACTUAL from clin_far_solicitudes sol where sol.soli_id = cab.movf_soli_id)), 0) AS centroconsumo "
		query = query + "   ,nvl((SELECT unor_correlativo FROM glo_unidades_organizacionales WHERE esacodigo = cab.esacodigo AND cod_servicio =(select sol.SOLI_CODSERVICIOACTUAL from clin_far_solicitudes sol where sol.soli_id = cab.movf_soli_id)), 0) AS centrocosto "
		query = query + "   ,nvl((SELECT fpar_valor FROM clin_far_param WHERE fpar_tipo = 66 AND fpar_codigo = 3), 0) as UsuarioProceso"
		if res.SoliID != 0 {
			query = query + "   , NVL((SELECT COUNT(mfde_mein_codmei) FROM clin_far_movimdet where mfde_soli_id = cab.movf_soli_id AND MFDE_ID = MDEV_MFDE_ID "
			switch res.TipoMovimiento {
			case 201:
				query = query + " 	AND mfde_tipo_mov in (150,160,140)"
			case 5:
				query = query + " 	AND mfde_tipo_mov in (105)"
			case 170:
				query = query + " 	AND mfde_tipo_mov in (30)"
			case 61:
				query = query + " 	AND mfde_tipo_mov in (150)"
			case 62:
				query = query + " 	AND mfde_tipo_mov in (160)"
			case 63:
				query = query + " 	AND mfde_tipo_mov in (140)"
			}
			query = query + " AND mfde_mein_id = det.mfde_mein_id"
			query = query + " GROUP BY mfde_mein_codmei HAVING COUNT(mfde_mein_codmei) > 0), 0)  AS CANT"
		} else {
			query = query + "   , NVL((SELECT COUNT(mfde_mein_codmei) FROM clin_far_movimdet WHERE mfde_agrupador_id = det.mfde_agrupador_id AND mfde_mein_id = det.mfde_mein_id AND int_erp_estado <> 'TRASPASADO' GROUP BY mfde_mein_codmei HAVING COUNT(mfde_mein_codmei) > 0), 0) AS CANT"
		}
		query = query + " , nvl(MFDE_REF_DESPACHO, 0) "
		query = query + " , dev.MDEV_AGRUPADOR_ID || det.mfde_ref_despacho AS NroRefExterno "
		query = query + " FROM "
		query = query + "     clin_far_movim cab, "
		query = query + "     clin_far_movimdet det, "
		query = query + "     clin_far_movim_devol dev "
		query = query + " WHERE  "
		query = query + "    cab.movf_id = det.mfde_movf_id "
		query = query + "    and det.mfde_id = dev.mdev_mfde_id "
		query = query + "    and dev.int_erp_estado <> 'TRASPASADO' AND dev.int_erp_error <> 'EXITO'  "
		if res.HdgCodigo != 0 {
			query = query + "       and cab.hdgcodigo = " + strconv.Itoa(res.HdgCodigo)
		}
		if res.CmeCodigo != 0 {
			query = query + "    and cab.cmecodigo = " + strconv.Itoa(res.CmeCodigo)
		}
		if res.EsaCodigo != 0 {
			query = query + "    and cab.esacodigo = " + strconv.Itoa(res.EsaCodigo)
		}
		if res.SoliID != 0 {
			query = query + " 	and cab.movf_soli_id = " + strconv.Itoa(res.SoliID)
		}
		if res.TipoMovimiento > 0 {
			query = query + " 	AND dev.MDEV_MOVF_TIPO = " + strconv.Itoa(res.TipoMovimiento)
		}
		if res.IDAgrupador > 0 {
			query = query + "       and dev.mdev_agrupador_id = " + strconv.Itoa(res.IDAgrupador) + " "
		}
		if res.NumeroMovimiento > 0 {
			query = query + "       and dev.mdev_id = " + strconv.Itoa(res.NumeroMovimiento)
		}
		if res.SobreGiro {
			query = query + "     and dev.int_erp_estado = 'PENDIENTE'"
		}

		var err error
		response, err = db.QueryContext(ctx, query)

		xmlLogger.Trace(logs.InformacionLog{
			Query:   query,
			Mensaje: "Query obtner todos los detalle de moviminetos pendiente de despachar a Fin700",
		})

		if err != nil {
			xmlLogger.Error(logs.InformacionLog{
				Query:   query,
				Mensaje: "Se cayo query obtner todos los detalle de moviminetos pendiente de despachar a Fin700",
				Error:   err,
			})
			return FOLIO
		}
		defer response.Close()
	}

	var (
		Empresa             string
		Division            string
		Unidad              string
		FechaProceso        string
		BodegaOrigen        string
		BodegaDestino       string
		FechaDocumento      string
		OperacionConsumoRef string
		Linea               string
		CtaID               string
		ProductoID          string
		ProductoCod         string
		CantidadStock       string
		Cantidad2           string
		ValorTotal          string
		CentroCosto         string
		ConceptoImp         string
		TipoProyecto        string
		NumeroProyecto      string
		UbicacionO          string
		UbicacionD          string
		Ubicacion           string
		NumeroLote          string
		LoteFecExpiracion   string
		NumeroSerie         string
		Tipo                int
		TipoMovim           string
		TipoSolicitud       string
		GlosaOperacion      string
		UsuarioProceso      string
		NroRefExterno       string
		MFDE_REF_DESPACHO   string
		Cant                int
		CantidadTotal       int
		LineaDetFisico      string

		TipoProceso     string
		TipoTransaccion string
		TipoOperacion   string
		CentroConsumo   string
		mdetID          string
		queryAux        string
		transaccion     int
	)

	var (
		BodegaOrigenAux  string
		BodegaDestinoAux string
		ReceID           string
		queryUpdate      string
		tabla            string
		mensageAux       string
		// estadoRslt       string
		// ResultWmConsSal  models.ResultWmConsultaSaldo
		indx int
	)
	indx = 0
	if response != nil {
		for response.Next() {
			err := response.Scan(&Empresa,
				&Division,
				&Unidad,
				&FechaProceso,
				&BodegaOrigen,
				&BodegaDestino,
				&FechaDocumento,
				&ReceID,
				&OperacionConsumoRef,
				&Linea,
				&CtaID,
				&mdetID,
				&ProductoID,
				&ProductoCod,
				&CantidadStock,
				&Cantidad2,
				&ValorTotal,
				&ConceptoImp,
				&TipoProyecto,
				&NumeroProyecto,
				&UbicacionO,
				&UbicacionD,
				&NumeroLote,
				&LoteFecExpiracion,
				&NumeroSerie,
				&Tipo,
				&TipoMovim,
				&TipoSolicitud,
				&GlosaOperacion,
				&CentroConsumo,
				&CentroCosto,
				&UsuarioProceso,
				&Cant,
				&MFDE_REF_DESPACHO,
				&NroRefExterno)

			if err != nil {
				xmlLogger.Error(logs.InformacionLog{
					Mensaje: "Se cayo scan obtner todos los detalle de moviminetos pendiente de despachar a Fin700",
					Error:   err,
				})
				return FOLIO
			}
			indx++
			BodegaOrigenAux = BodegaOrigen
			BodegaDestinoAux = BodegaDestino
			switch Tipo {
			case 15:
				TipoProceso = "AJU" // CONSUMO
				ValorTotal = "0"
				BodegaOrigen = "0"
				Ubicacion = UbicacionO
				BodegaDestino = BodegaOrigenAux
				TipoTransaccion = "1" // SALIDA
				TipoOperacion = "19"
				CentroConsumo = "0"
				CentroCosto = "0"
			case 16: // ingreso de fraccionamiento
				TipoProceso = "AJU" // CONSUMO
				BodegaOrigen = BodegaDestinoAux
				BodegaDestino = "0"
				TipoTransaccion = "1" // ENTRADA
				TipoOperacion = "27"
				CentroConsumo = "0"
				Ubicacion = UbicacionO
				Cantidad := 0
				NroRefExternoAux := strconv.Itoa(res.TipoMovimiento) + NroRefExterno
				NroRefExterno = NroRefExternoAux
				queryAux = " select MFDE_MEIN_CODMEI, MFDE_CANTIDAD from "
				queryAux = queryAux + " ( Select deta.mfde_mein_codmei, MFDE_CANTIDAD "
				queryAux = queryAux + " from clin_far_movimdet deta "
				queryAux = queryAux + " where deta.mfde_tipo_mov = 116 "
				queryAux = queryAux + " and deta.mfde_agrupador_id = " + strconv.Itoa(res.IDAgrupador) + ")"

				ctxAux := context.Background()
				rowsAux, errAux := db.QueryContext(ctxAux, queryAux)

				xmlLogger.Trace(logs.InformacionLog{
					Query:   queryAux,
					Mensaje: "Query obtener codmei ingreso de fraccionamiento",
				})

				if errAux != nil {
					xmlLogger.Error(logs.InformacionLog{
						Query:   queryAux,
						Mensaje: "Se cayo query obtener codmei ingreso de fraccionamiento",
						Error:   errAux,
					})
					return FOLIO
				}
				defer rowsAux.Close()

				var codMeiAux string
				for rowsAux.Next() {
					errAux := rowsAux.Scan(&codMeiAux, &Cantidad)
					if errAux != nil {
						xmlLogger.Error(logs.InformacionLog{
							Mensaje: "Se cayo scan obtener codmei ingreso de fraccionamiento",
							Error:   err,
						})
						return FOLIO
					}
				}
				queryAux = " select fbod_codigo from "
				queryAux = queryAux + " clin_far_bodegas "
				queryAux = queryAux + " where fbo_codigobodega = " + BodegaDestinoAux
				ctxAux = context.Background()
				rowsAux, errAux = db.QueryContext(ctxAux, queryAux)

				xmlLogger.Trace(logs.InformacionLog{
					Query:   queryAux,
					Mensaje: "Query obtener bodega ingreso de fraccionamiento",
				})

				if errAux != nil {
					xmlLogger.Error(logs.InformacionLog{
						Query:   queryAux,
						Mensaje: "Se cayo query obtener bodega ingreso de fraccionamiento",
						Error:   errAux,
					})
					return FOLIO
				}
				defer rowsAux.Close()

				var bodega string
				for rowsAux.Next() {
					errAux := rowsAux.Scan(&bodega)
					if errAux != nil {
						xmlLogger.Error(logs.InformacionLog{
							Mensaje: "Se cayo scan obtener bodegas ingreso de fraccionamiento",
							Error:   errAux,
						})
						return FOLIO
					}
				}
				ResultWmConsSal, err := WmConsultaSaldo(Empresa, Unidad, bodega, ProductoCod, 0, res.Servidor)
				if err != nil {
					xmlLogger.Error(logs.InformacionLog{
						Mensaje: "Fallo consulta de saldo WS",
						Error:   err,
					})
					return FOLIO
				}

				CostoMedio, _ := strconv.Atoi(ResultWmConsSal.CostoMedio)
				VCostoMedio, _ := strconv.Atoi(CantidadStock)
				if CostoMedio > 0 {
					ValProm := VCostoMedio * int(CostoMedio)
					ValorTotal = strconv.Itoa(ValProm)
					// ValorTotal = ResultWmConsSal.CostoMedio
				} else {
					ResultWmConsSal, err = WmConsultaSaldo(Empresa, Unidad, bodega, codMeiAux, 0, res.Servidor)
					if err != nil {
						xmlLogger.Error(logs.InformacionLog{
							Mensaje: "Fallo consulta de saldo WS",
							Error:   err,
						})
						return FOLIO
					}

					CostoMedio, err := strconv.ParseFloat(ResultWmConsSal.CostoMedio, 64)
					if err != nil {
						xmlLogger.Error(logs.InformacionLog{
							Mensaje: "Parsear costo medio en case 16 ingreso de fraccionamiento",
							Error:   err,
						})
						return FOLIO
					}
					ValProm := Cantidad * int(CostoMedio)
					ValorTotal = strconv.Itoa(ValProm)
				}
				queryAux = " SELECT unor_correlativo FROM glo_unidades_organizacionales "
				queryAux = queryAux + " WHERE esacodigo = " + Empresa + " AND cod_servicio = ( "
				queryAux = queryAux + " select reg.CODIGO_SERVICIO from clin_far_reglas reg "
				queryAux = queryAux + " where reg.REGLA_BODEGACODIGO = " + BodegaOrigen + " ) "

				ctxAux = context.Background()
				rowsAux, errAux = db.QueryContext(ctxAux, queryAux)

				xmlLogger.Trace(logs.InformacionLog{
					Query:   queryAux,
					Mensaje: "Query obtener codMei ingreso de fraccionamiento",
				})

				if errAux != nil {
					xmlLogger.Error(logs.InformacionLog{
						Query:   queryAux,
						Mensaje: "Se cayo query obtener codMei ingreso de fraccionamiento",
						Error:   errAux,
					})
					return FOLIO
				}
				defer rowsAux.Close()

				for rowsAux.Next() {
					errAux := rowsAux.Scan(&CentroCosto)
					if errAux != nil {
						xmlLogger.Error(logs.InformacionLog{
							Mensaje: "Se cayo scan ingreso de fraccionamiento",
							Error:   errAux,
						})
						return FOLIO
					}
				}
			case 17: // ingreso devolucion fraccionamiento
				TipoProceso = "CON" // CONSUMO
				ValorTotal = "0"
				Ubicacion = UbicacionO
				BodegaOrigen = BodegaDestino
				BodegaDestino = "0"
				OperacionConsumoRef = "0"
				TipoTransaccion = "2" // SALIDA
				TipoOperacion = "26"
				queryAux = " SELECT unor_correlativo, CENTROCONSUMO FROM glo_unidades_organizacionales "
				queryAux = queryAux + " WHERE esacodigo = " + Empresa + " AND cod_servicio = ( "
				queryAux = queryAux + " select reg.CODIGO_SERVICIO from clin_far_reglas reg "
				queryAux = queryAux + " where reg.REGLA_BODEGACODIGO = (SELECT FBOD_CODIGO FROM CLIN_FAR_BODEGAS WHERE FBO_CODIGOBODEGA = " + BodegaOrigen + " )) "
				ctxAux := context.Background()
				rowsAux, errAux := db.QueryContext(ctxAux, queryAux)

				xmlLogger.Trace(logs.InformacionLog{
					Query:   queryAux,
					Mensaje: "Query obtener unor correlativo ingreso devolucion paciente",
				})

				if errAux != nil {
					xmlLogger.Error(logs.InformacionLog{
						Query:   queryAux,
						Mensaje: "Se cayo query obtener unor correlativo ingreso devolucion paciente",
						Error:   errAux,
					})
					return FOLIO
				}
				defer rowsAux.Close()
				for rowsAux.Next() {
					errAux := rowsAux.Scan(&CentroCosto, &CentroConsumo)
					if errAux != nil {
						xmlLogger.Error(logs.InformacionLog{
							Mensaje: "Se cayo scan obtener unor correlativo ingreso devolucion paciente",
							Error:   errAux,
						})
						return FOLIO
					}
				}
			case 50:
				TipoProceso = "TRA" // TRASPASO
				BodegaOrigen = BodegaDestinoAux
				BodegaDestino = BodegaOrigenAux
				Ubicacion = UbicacionD
				ValorTotal = "0"
				TipoOperacion = "6"
				TipoTransaccion = "1" // ENTRADA
				CentroConsumo = "0"
				CentroCosto = "0"
				queryAux = "select nvl(mdev_referencia_contable, 0) AS num_referencia "
				queryAux = queryAux + "from clin_far_movim_devol "
				queryAux = queryAux + " where mdev_id = ( "
				queryAux = queryAux + "   select nvl(mfde_mdev_id, 0)  "
				queryAux = queryAux + "   from clin_far_movimdet "
				queryAux = queryAux + "   where mfde_id = " + mdetID + ")"

				ctxAux := context.Background()
				rowsAux, errAux := db.QueryContext(ctxAux, queryAux)

				xmlLogger.Trace(logs.InformacionLog{
					Query:   queryAux,
					Mensaje: "Query obtener Operacion de Referencia",
				})

				if errAux != nil {
					xmlLogger.Error(logs.InformacionLog{
						Query:   queryAux,
						Mensaje: "Se cayo query obtener Operacion de Referencia",
						Error:   errAux,
					})
					return FOLIO
				}
				defer rowsAux.Close()
				for rowsAux.Next() {
					errAux := rowsAux.Scan(&OperacionConsumoRef)
					if errAux != nil {
						xmlLogger.Error(logs.InformacionLog{
							Mensaje: "Se cayo scan obtener Operacion de Referencia",
							Error:   errAux,
						})
						return FOLIO
					}
				}
			case 30:
				TipoProceso = "TRA" // TRASPASO
				ValorTotal = "0"
				TipoTransaccion = "1" // ENTRADA
				Ubicacion = UbicacionO
				CentroConsumo = "0"
				BodegaOrigen = BodegaOrigenAux
				BodegaDestino = BodegaDestinoAux
				if BodegaDestino == "22" {
					TipoOperacion = "32"
				} else {
					TipoOperacion = "6"
				}
				CentroCosto = "0"
				OperacionConsumoRef = "0"
				// queryAux = ""
				// queryAux = " select nvl(mfde_referencia_contable, 0) "
				// queryAux = queryAux + " from clin_far_movimdet "
				// queryAux = queryAux + " where  mfde_tipo_mov IN (100,102) "
				// queryAux = queryAux + " and int_erp_error = ' ' "
				// queryAux = queryAux + " and mfde_soli_id = " + strconv.Itoa(res.SoliID)
				// queryAux = queryAux + " and mfde_mein_codmei = '" + ProductoCod + "'"
				// if NumeroLote != " " {
				// 	queryAux = queryAux + " and mfde_lote = '" + NumeroLote + "'"
				// }
				// queryAux = queryAux + " and MFDE_CANTIDAD = '" + CantidadStock + "'"

				// log.Println("\n QUERY: \n", queryAux)
				// ctxAux := context.Background()
				// rowsAux, errAux := db.QueryContext(ctxAux, queryAux)
				// if errAux != nil {
				// 	log.Println("Error Select en (obtener Operacion de Referencia): \n", queryAux)
				// 	log.Println(errAux, rowsAux)
				// }
				// defer rowsAux.Close()
				// for rowsAux.Next() {
				// 	errAux := rowsAux.Scan(&OperacionConsumoRef)
				// 	if errAux != nil {
				// 		return FOLIO
				// 	}
				// }

				OperacionConsumoRef = MFDE_REF_DESPACHO
			case 32:
				TipoProceso = "TRA" // TRASPASO
				ValorTotal = "0"
				TipoTransaccion = "1" // ENTRADA
				Ubicacion = UbicacionD
				CentroConsumo = "0"
				BodegaDestino = BodegaDestinoAux
				BodegaOrigen = BodegaOrigenAux
				if BodegaDestino == "22" {
					TipoOperacion = "32"
				} else {
					TipoOperacion = "6"
				}
				CentroCosto = "0"
			case 100:
				TipoProceso = "TRA" // TRASPASO
				ValorTotal = "0"
				BodegaOrigen = BodegaDestinoAux
				BodegaDestino = BodegaOrigenAux
				Ubicacion = UbicacionD
				if TipoSolicitud == "60" {
					TipoProceso = "CON"
					TipoOperacion = "22"
					BodegaDestino = "0"
					queryAux := "SELECT nvl(CENTROCONSUMO,0) FROM glo_unidades_organizacionales "
					queryAux = queryAux + " WHERE ID_Servicio= (SELECT MAX(BS_SERV_ID) ID_SERVICIO "
					queryAux = queryAux + " FROM clin_far_bodega_servicio WHERE bs_fbod_codigo=" + BodegaDestino
					queryAux = queryAux + " AND esacodigo       = 2) AND UNOR_TYPE='CCOS' and ESACODIGO = " + Empresa

					ctxAux := context.Background()
					rowsAux, errAux := db.QueryContext(ctxAux, queryAux)

					xmlLogger.Trace(logs.InformacionLog{
						Query:   queryAux,
						Mensaje: "Query obtener centro de consumo",
					})

					if errAux != nil {
						xmlLogger.Error(logs.InformacionLog{
							Query:   queryAux,
							Mensaje: "Se cayo query obtener centro de consumo",
							Error:   errAux,
						})
						return FOLIO
					}
					defer rowsAux.Close()
					for rowsAux.Next() {
						errAux := rowsAux.Scan(&CentroConsumo)
						if errAux != nil {
							xmlLogger.Error(logs.InformacionLog{
								Mensaje: "Se cayo scan obtener centro de consumo",
								Error:   errAux,
							})
							return FOLIO
						}
					}
				} else if BodegaOrigen == "22" {
					TipoOperacion = "32"
				} else {
					TipoOperacion = "6"
				}
				TipoTransaccion = "2" // SALIDA
				CentroConsumo = "0"
				OperacionConsumoRef = "0"
				CentroCosto = "0"
			case 105:
				TipoProceso = "CON" // CONSUMO
				ValorTotal = "0"
				BodegaOrigen = BodegaDestinoAux
				Ubicacion = UbicacionO
				BodegaDestino = "0"
				TipoTransaccion = "2" // SALIDA
				TipoOperacion = "22"
				queryAux := "select nvl(guo.centroconsumo, 0), nvl(guo.unor_correlativo,0) "
				queryAux = queryAux + "from glo_unidades_organizacionales guo "
				queryAux = queryAux + "where guo.cod_servicio = (select soli_codservicioactual from  "
				queryAux = queryAux + "clin_far_solicitudes where SOLI_ID = " + strconv.Itoa(res.SoliID) + ")  and ESACODIGO = " + Empresa

				ctxAux := context.Background()
				rowsAux, errAux := db.QueryContext(ctxAux, queryAux)

				xmlLogger.Trace(logs.InformacionLog{
					Query:   queryAux,
					Mensaje: "Query obtener centro de consumo y unor correlativo",
				})

				if errAux != nil {
					xmlLogger.Error(logs.InformacionLog{
						Query:   queryAux,
						Mensaje: "Se cayo query obtener centro de consumo y unor correlativo",
						Error:   errAux,
					})
					return FOLIO
				}
				defer rowsAux.Close()
				for rowsAux.Next() {
					errAux := rowsAux.Scan(&CentroConsumo, &CentroCosto)
					if errAux != nil {
						xmlLogger.Error(logs.InformacionLog{
							Mensaje: "Se cayo scan obtener centro de consumo y unor correlativo",
							Error:   errAux,
						})
						return FOLIO
					}
				}
				OperacionConsumoRef = "0"
			case 201:
				TipoProceso = "CON" // CONSUMO
				ValorTotal = "0"
				BodegaOrigen = BodegaDestinoAux
				Ubicacion = UbicacionO
				BodegaDestino = "0"
				TipoTransaccion = "2" // SALIDA
				TipoOperacion = "22"
				NroRefExterno = NroRefExterno + "201"
				GlosaOperacion = "Rechazo Consumo Paciente"
				queryAux := "select nvl(guo.centroconsumo, 0), nvl(guo.unor_correlativo,0) "
				queryAux = queryAux + "from glo_unidades_organizacionales guo "
				queryAux = queryAux + "where guo.cod_servicio = (select soli_codservicioactual from  "
				queryAux = queryAux + "clin_far_solicitudes where SOLI_ID = " + strconv.Itoa(res.SoliID) + ")  and ESACODIGO = " + Empresa

				ctxAux := context.Background()
				rowsAux, errAux := db.QueryContext(ctxAux, queryAux)

				xmlLogger.Trace(logs.InformacionLog{
					Query:   queryAux,
					Mensaje: "Query obtener CentroConsumo y CentroCosto",
				})

				if errAux != nil {
					xmlLogger.Error(logs.InformacionLog{
						Query:   queryAux,
						Mensaje: "Se cayo query obtener CentroConsumo y CentroCosto",
						Error:   errAux,
					})
					return FOLIO
				}
				defer rowsAux.Close()
				for rowsAux.Next() {
					errAux := rowsAux.Scan(&CentroConsumo, &CentroCosto)
					if errAux != nil {
						xmlLogger.Error(logs.InformacionLog{
							Mensaje: "Se cayo scan obtener CentroConsumo y CentroCosto",
							Error:   errAux,
						})
						return FOLIO
					}
				}
				OperacionConsumoRef = "0"
			case 115:
				TipoProceso = "AJU" // CONSUMO
				ValorTotal = "0"
				BodegaOrigen = "0"
				BodegaDestino = BodegaOrigenAux
				Ubicacion = UbicacionO
				TipoTransaccion = "1" // SALIDA
				TipoOperacion = "19"
				CentroConsumo = "0"
				CentroCosto = "0"
				OperacionConsumoRef = "0"
			case 116: // salida por fraccionamiento
				TipoProceso = "CON" // CONSUMO
				ValorTotal = "0"
				BodegaOrigen = BodegaDestino
				BodegaDestino = "0"
				Ubicacion = UbicacionO
				OperacionConsumoRef = "0"
				TipoTransaccion = "2" // SALIDA
				TipoOperacion = "26"
				NroRefExternoAux := strconv.Itoa(res.TipoMovimiento) + NroRefExterno
				NroRefExterno = NroRefExternoAux
				queryAux = " SELECT UNOR_CORRELATIVO, CENTROCONSUMO FROM GLO_UNIDADES_ORGANIZACIONALES "
				queryAux = queryAux + " WHERE ESACODIGO = " + Empresa + " AND COD_SERVICIO = ( "
				queryAux = queryAux + " SELECT REG.CODIGO_SERVICIO FROM CLIN_FAR_REGLAS REG "
				queryAux = queryAux + " WHERE REG.REGLA_BODEGACODIGO =  ( "
				queryAux = queryAux + " SELECT FBOD_CODIGO FROM "
				queryAux = queryAux + " CLIN_FAR_BODEGAS "
				queryAux = queryAux + " WHERE FBO_CODIGOBODEGA = " + BodegaOrigen + ") ) "
				ctxAux := context.Background()
				rowsAux, errAux := db.QueryContext(ctxAux, queryAux)

				xmlLogger.Trace(logs.InformacionLog{
					Query:   queryAux,
					Mensaje: "Query obtener CentroConsumo y CentroCosto en salida por fraccionamiento",
				})

				if errAux != nil {
					xmlLogger.Error(logs.InformacionLog{
						Query:   queryAux,
						Mensaje: "Se cayo query obtener CentroConsumo y CentroCosto en salida por fraccionamiento",
						Error:   errAux,
					})
					return FOLIO
				}
				defer rowsAux.Close()
				for rowsAux.Next() {
					errAux := rowsAux.Scan(&CentroCosto, &CentroConsumo)
					if errAux != nil {
						xmlLogger.Error(logs.InformacionLog{
							Mensaje: "Se cayo scan obtener CentroConsumo y CentroCosto en salida por fraccionamiento",
							Error:   errAux,
						})
						return FOLIO
					}
				}
			case 117: // salida por devolucion fraccionamiento
				TipoProceso = "AJU" // CONSUMO
				BodegaOrigen = BodegaDestinoAux
				Ubicacion = UbicacionO
				BodegaDestino = "0"
				TipoTransaccion = "1" // ENTRADA
				TipoOperacion = "27"
				NroRefExternoAux := strconv.Itoa(res.TipoMovimiento) + NroRefExterno
				NroRefExterno = NroRefExternoAux
				queryAux = " select MFDE_MEIN_CODMEI from "
				queryAux = queryAux + " (Select deta.mfde_mein_codmei "
				queryAux = queryAux + " from clin_far_movimdet deta "
				queryAux = queryAux + " where deta.mfde_tipo_mov = 17 "
				queryAux = queryAux + " order by deta.mfde_id desc) "
				queryAux = queryAux + " where rownum = 1 "
				ctxAux := context.Background()
				rowsAux, errAux := db.QueryContext(ctxAux, queryAux)

				xmlLogger.Trace(logs.InformacionLog{
					Query:   queryAux,
					Mensaje: "Query obtener codmei en salida por devolucion fraccionamiento",
				})

				if errAux != nil {
					xmlLogger.Error(logs.InformacionLog{
						Query:   queryAux,
						Mensaje: "Se cayo query obtener codmei en salida por devolucion fraccionamiento",
						Error:   errAux,
					})
					return FOLIO
				}
				var codMeiAux string
				defer rowsAux.Close()
				for rowsAux.Next() {
					errAux := rowsAux.Scan(&codMeiAux)
					if errAux != nil {
						xmlLogger.Error(logs.InformacionLog{
							Mensaje: "Se cayo scan obtener codmei en salida por devolucion fraccionamiento",
							Error:   errAux,
						})
						return FOLIO
					}
				}

				queryAux = " select fbod_codigo from "
				queryAux = queryAux + " clin_far_bodegas "
				queryAux = queryAux + " where fbo_codigobodega = " + BodegaDestinoAux
				ctxAux = context.Background()
				rowsAux, errAux = db.QueryContext(ctxAux, queryAux)

				xmlLogger.Trace(logs.InformacionLog{
					Query:   queryAux,
					Mensaje: "Query obtener bodega en salida por devolucion fraccionamiento",
				})

				if errAux != nil {
					xmlLogger.Error(logs.InformacionLog{
						Query:   queryAux,
						Mensaje: "Se cayo query obtener bodega en salida por devolucion fraccionamiento",
						Error:   errAux,
					})
					return 0
				}
				var bodega string
				defer rowsAux.Close()
				for rowsAux.Next() {
					errAux := rowsAux.Scan(&bodega)
					if errAux != nil {
						xmlLogger.Error(logs.InformacionLog{
							Mensaje: "Se cayo scan obtener bodega en salida por devolucion fraccionamiento",
							Error:   errAux,
						})
						return FOLIO
					}
				}
				queryAux = " SELECT unor_correlativo, centroconsumo FROM glo_unidades_organizacionales "
				queryAux = queryAux + " WHERE esacodigo = " + Empresa + " AND cod_servicio = ( "
				queryAux = queryAux + " select reg.CODIGO_SERVICIO from clin_far_reglas reg "
				queryAux = queryAux + " where reg.REGLA_BODEGACODIGO = (SELECT FBOD_CODIGO FROM CLIN_FAR_BODEGAS WHERE FBO_CODIGOBODEGA = " + BodegaOrigen + " )) "
				ctxAux = context.Background()
				rowsAux, errAux = db.QueryContext(ctxAux, queryAux)

				xmlLogger.Trace(logs.InformacionLog{
					Query:   queryAux,
					Mensaje: "Query unor correlativo y centro consumo en salida por devolucion fraccionamiento",
				})

				if errAux != nil {
					xmlLogger.Error(logs.InformacionLog{
						Query:   queryAux,
						Mensaje: "Se cayo query unor correlativo y centro consumo en salida por devolucion fraccionamiento",
						Error:   errAux,
					})
					return FOLIO
				}
				defer rowsAux.Close()
				for rowsAux.Next() {
					errAux := rowsAux.Scan(&CentroCosto, &CentroConsumo)
					if errAux != nil {
						xmlLogger.Error(logs.InformacionLog{
							Mensaje: "Se cayo scan unor correlativo y centro consumo en salida por devolucion fraccionamiento",
							Error:   errAux,
						})
						return FOLIO
					}
				}
				CentroConsumo = "0"
				Cantidad := 0
				queryAux = " select MFDE_MEIN_CODMEI, MFDE_CANTIDAD from "
				queryAux = queryAux + " ( Select deta.mfde_mein_codmei, MFDE_CANTIDAD "
				queryAux = queryAux + " from clin_far_movimdet deta "
				queryAux = queryAux + " where deta.mfde_tipo_mov = 17 "
				queryAux = queryAux + " and deta.mfde_agrupador_id = " + strconv.Itoa(res.IDAgrupador) + ")"
				ctxAux = context.Background()
				rowsAux, errAux = db.QueryContext(ctxAux, queryAux)

				xmlLogger.Trace(logs.InformacionLog{
					Query:   queryAux,
					Mensaje: "Query obtener codmei en salida por devolucion fraccionamiento",
				})

				if errAux != nil {
					xmlLogger.Error(logs.InformacionLog{
						Query:   queryAux,
						Mensaje: "Se cayo query obtener codmei en salida por devolucion fraccionamiento",
						Error:   errAux,
					})
					return FOLIO
				}
				defer rowsAux.Close()
				for rowsAux.Next() {
					errAux := rowsAux.Scan(&codMeiAux, &Cantidad)
					if errAux != nil {
						xmlLogger.Error(logs.InformacionLog{
							Mensaje: "Se cayo scan obtener codmei en salida por devolucion fraccionamiento",
							Error:   errAux,
						})
						return FOLIO
					}
				}
				ResultWmConsSal, err := WmConsultaSaldo(Empresa, Unidad, bodega, ProductoCod, 0, res.Servidor)
				if err != nil {
					xmlLogger.Error(logs.InformacionLog{
						Mensaje: "Fallo consulta de saldo WS",
						Error:   err,
					})
					return FOLIO
				}
				CostoMedio, _ := strconv.Atoi(ResultWmConsSal.CostoMedio)
				if CostoMedio > 0 {
					ValorTotal = ResultWmConsSal.CostoMedio
				} else {
					ResultWmConsSal, err = WmConsultaSaldo(Empresa, Unidad, bodega, codMeiAux, 0, res.Servidor)
					if err != nil {
						xmlLogger.Error(logs.InformacionLog{
							Mensaje: "Fallo consulta de saldo WS",
							Error:   err,
						})
						return FOLIO
					}
					CostoMedio, err := strconv.ParseFloat(ResultWmConsSal.CostoMedio, 64)
					if err != nil {
						xmlLogger.Error(logs.InformacionLog{
							Mensaje: "Se cayo parsear costo medio en salida por devolucion fraccionamiento",
							Error:   err,
						})
						return FOLIO
					}
					ValProm := Cantidad * int(CostoMedio)
					ValorTotal = strconv.Itoa(ValProm)
				}
				queryAux = " SELECT unor_correlativo FROM glo_unidades_organizacionales "
				queryAux = queryAux + " WHERE esacodigo = " + Empresa + " AND cod_servicio = ( "
				queryAux = queryAux + " select reg.CODIGO_SERVICIO from clin_far_reglas reg "
				queryAux = queryAux + " where reg.REGLA_BODEGACODIGO = " + BodegaOrigen + " ) "

				ctxAux = context.Background()
				rowsAux, errAux = db.QueryContext(ctxAux, queryAux)

				xmlLogger.Trace(logs.InformacionLog{
					Query:   queryAux,
					Mensaje: "Query obtener unor correlativo en salida por devolucion fraccionamiento",
				})

				if errAux != nil {
					xmlLogger.Error(logs.InformacionLog{
						Query:   queryAux,
						Mensaje: "Se cayo query obtener unor correlativo en salida por devolucion fraccionamiento",
						Error:   errAux,
					})
					return FOLIO
				}
				defer rowsAux.Close()
				for rowsAux.Next() {
					errAux := rowsAux.Scan(&CentroCosto)
					if errAux != nil {
						xmlLogger.Error(logs.InformacionLog{
							Mensaje: "Se cayo scan obtener unor correlativo en salida por devolucion fraccionamiento",
							Error:   errAux,
						})
						return FOLIO
					}
				}

				// log.Println("case 117: ValorTotal = ", ValorTotal)
			case 140:
				TipoProceso = "CON" // CONSUMO
				ValorTotal = "0"
				Ubicacion = UbicacionD
				if ReceID > "0" {
					TipoOperacion = "28"
				} else {
					TipoOperacion = "29"
					queryAux := "select nvl(guo.centroconsumo, 0), nvl(guo.unor_correlativo,0) "
					queryAux = queryAux + "from glo_unidades_organizacionales guo "
					queryAux = queryAux + "where guo.cod_servicio = (select soli_codservicioactual from  "
					queryAux = queryAux + "clin_far_solicitudes where SOLI_ID = " + strconv.Itoa(res.SoliID) + ") and ESACODIGO = " + Empresa

					ctxAux := context.Background()
					rowsAux, errAux := db.QueryContext(ctxAux, queryAux)
					xmlLogger.Trace(logs.InformacionLog{
						Query:   queryAux,
						Mensaje: "Query obtener unor correlativo y centro de consumo",
					})

					if errAux != nil {
						xmlLogger.Error(logs.InformacionLog{
							Query:   queryAux,
							Mensaje: "Se cayo query obtener unor correlativo y centro de consumo",
							Error:   errAux,
						})
						return FOLIO
					}
					defer rowsAux.Close()
					for rowsAux.Next() {
						errAux := rowsAux.Scan(&CentroConsumo, &CentroCosto)
						if errAux != nil {
							xmlLogger.Error(logs.InformacionLog{
								Mensaje: "Se cayo scan obtener unor correlativo y centro de consumo",
								Error:   errAux,
							})
							return FOLIO
						}
					}
				}
				if CentroConsumo == "" {
					CentroConsumo = "0"
				}
				if CentroCosto == "" {
					CentroCosto = "0"
				}
				TipoTransaccion = "2" // SALIDA
				if BodegaOrigen != BodegaDestino {
					BodegaOrigen = BodegaDestino
					Ubicacion = UbicacionO
				}
				OperacionConsumoRef = "0"
				BodegaDestino = "0"
			case 150:
				TipoProceso = "CON" // CONSUMO
				ValorTotal = "0"
				Ubicacion = UbicacionO
				if ReceID > "0" {
					TipoOperacion = "28"
				} else {
					TipoOperacion = "29"
					queryAux := "select nvl(guo.centroconsumo, 0), nvl(guo.unor_correlativo,0) "
					queryAux = queryAux + "from glo_unidades_organizacionales guo "
					queryAux = queryAux + "where guo.cod_servicio = (select soli_codservicioactual from  "
					queryAux = queryAux + "clin_far_solicitudes where SOLI_ID = " + strconv.Itoa(res.SoliID) + ")  and ESACODIGO = " + Empresa

					ctxAux := context.Background()
					rowsAux, errAux := db.QueryContext(ctxAux, queryAux)

					xmlLogger.Trace(logs.InformacionLog{
						Query:   queryAux,
						Mensaje: "Query obtener unor correlativo y centro de consumo",
					})

					if errAux != nil {
						xmlLogger.Error(logs.InformacionLog{
							Query:   queryAux,
							Mensaje: "Se cayo query obtener unor correlativo y centro de consumo",
							Error:   errAux,
						})
						return FOLIO
					}
					defer rowsAux.Close()
					for rowsAux.Next() {
						errAux := rowsAux.Scan(&CentroConsumo, &CentroCosto)
						if errAux != nil {
							xmlLogger.Error(logs.InformacionLog{
								Mensaje: "Se cayo scan obtener unor correlativo y centro de consumo",
								Error:   errAux,
							})
							return FOLIO
						}
					}
				}
				if CentroConsumo == "" {
					CentroConsumo = "0"
				}
				if CentroCosto == "" {
					CentroCosto = "0"
				}
				TipoTransaccion = "2" // SALIDA
				if BodegaOrigen != BodegaDestinoAux {
					Ubicacion = UbicacionD
				}
				OperacionConsumoRef = "0"
				BodegaDestino = "0"
			case 160:
				TipoProceso = "CON" // CONSUMO
				ValorTotal = "0"
				if ReceID > "0" {
					TipoOperacion = "28"
				} else {
					TipoOperacion = "29"
				}
				TipoTransaccion = "2" // SALIDA
				BodegaOrigen = BodegaDestinoAux
				BodegaDestino = "0"
				Ubicacion = UbicacionO
				OperacionConsumoRef = "0"
				queryAux := "select nvl(guo.centroconsumo, 0), nvl(guo.unor_correlativo,0) "
				queryAux = queryAux + "from glo_unidades_organizacionales guo "
				queryAux = queryAux + "where guo.cod_servicio = (select soli_codservicioactual from  "
				queryAux = queryAux + "clin_far_solicitudes where SOLI_ID = " + strconv.Itoa(res.SoliID) + ")  and ESACODIGO = " + Empresa

				ctxAux := context.Background()
				rowsAux, errAux := db.QueryContext(ctxAux, queryAux)

				xmlLogger.Trace(logs.InformacionLog{
					Query:   queryAux,
					Mensaje: "Query obtener unor correlativo y centro de consumo",
				})

				if errAux != nil {
					xmlLogger.Error(logs.InformacionLog{
						Query:   queryAux,
						Mensaje: "Se cayo query obtener unor correlativo y centro de consumo",
						Error:   errAux,
					})
					return FOLIO
				}
				defer rowsAux.Close()
				for rowsAux.Next() {
					errAux := rowsAux.Scan(&CentroConsumo, &CentroCosto)
					if errAux != nil {
						xmlLogger.Error(logs.InformacionLog{
							Mensaje: "Se cayo scan obtener unor correlativo y centro de consumo",
							Error:   errAux,
						})
						return FOLIO
					}
				}
			case 170:
				TipoProceso = "TRA" // TRASPASO
				ValorTotal = "0"
				TipoOperacion = "6"
				TipoTransaccion = "2" // SALIDA
				CentroConsumo = "0"
				CentroCosto = "0"
				BodegaOrigen = BodegaOrigenAux
				BodegaDestino = BodegaDestinoAux
				Ubicacion = UbicacionO
				OperacionConsumoRef = "0"
			case 60:
				TipoProceso = "DEV" // DEVOLUCION
				ValorTotal = "0"
				if ReceID > "0" {
					TipoOperacion = "28"
				} else {
					TipoOperacion = "29"
				}
				TipoTransaccion = "1" // ENTRADA
				Ubicacion = UbicacionD
				BodegaOrigen = BodegaDestino
				BodegaDestino = "0"
				OperacionConsumoRef = "0"
				ValorTotal = "0"
				CentroConsumo = "0"
				CentroCosto = "0"
				queryAux := "select nvl(guo.centroconsumo, 0), nvl(guo.unor_correlativo,0) "
				queryAux = queryAux + "from glo_unidades_organizacionales guo "
				queryAux = queryAux + "where guo.cod_servicio = (select soli_codservicioactual from  "
				queryAux = queryAux + "clin_far_solicitudes where SOLI_ID = " + strconv.Itoa(res.SoliID) + ") and ESACODIGO = " + Empresa

				ctxAux := context.Background()
				rowsAux, errAux := db.QueryContext(ctxAux, queryAux)
				xmlLogger.Trace(logs.InformacionLog{
					Query:   queryAux,
					Mensaje: "Query obtener unor correlativo y centro de consumo",
				})

				if errAux != nil {
					xmlLogger.Error(logs.InformacionLog{
						Query:   queryAux,
						Mensaje: "Se cayo query obtener unor correlativo y centro de consumo",
						Error:   errAux,
					})
					return FOLIO
				}
				defer rowsAux.Close()
				for rowsAux.Next() {
					errAux := rowsAux.Scan(&CentroConsumo, &CentroCosto)
					if errAux != nil {

						return FOLIO
					}
				}
				MfdeIDaux := "0"
				queryAux = ""
				queryAux = " select nvl(mfde_referencia_contable, 0), mfde_id "
				queryAux = queryAux + " from clin_far_movimdet "
				queryAux = queryAux + " where  mfde_tipo_mov IN (100,102) "
				queryAux = queryAux + " and mfde_soli_id = " + strconv.Itoa(res.SoliID)
				queryAux = queryAux + " and mfde_mein_codmei = '" + ProductoCod + "'"
				queryAux = queryAux + " and MFDE_CANTIDAD = '" + CantidadStock + "'"

				ctxAux = context.Background()
				rowsAux, errAux = db.QueryContext(ctxAux, queryAux)

				xmlLogger.Trace(logs.InformacionLog{
					Query:   queryAux,
					Mensaje: "Query obtener operacion de referencia",
				})

				if errAux != nil {
					xmlLogger.Error(logs.InformacionLog{
						Query:   queryAux,
						Mensaje: "Se cayo query obtener operacion de referencia",
						Error:   errAux,
					})
					return FOLIO
				}
				defer rowsAux.Close()
				for rowsAux.Next() {
					errAux := rowsAux.Scan(&OperacionConsumoRef, &MfdeIDaux)
					if errAux != nil {
						xmlLogger.Error(logs.InformacionLog{
							Mensaje: "Se cayo scan obtener operacion de referencia",
							Error:   errAux,
						})
						return FOLIO
					}
				}
			case 61:
				TipoProceso = "DEV" // DEVOLUCION
				ValorTotal = "0"
				if ReceID > "0" {
					TipoOperacion = "28"
				} else {
					TipoOperacion = "29"
				}
				TipoTransaccion = "1" // ENTRADA
				Ubicacion = UbicacionD
				BodegaOrigen = BodegaDestino
				BodegaDestino = "0"
				OperacionConsumoRef = "0"
				ValorTotal = "0"
				CentroConsumo = "0"
				CentroCosto = "0"
				queryAux := "select nvl(guo.centroconsumo, 0), nvl(guo.unor_correlativo,0) "
				queryAux = queryAux + "from glo_unidades_organizacionales guo "
				queryAux = queryAux + "where guo.cod_servicio = (select soli_codservicioactual from  "
				queryAux = queryAux + "clin_far_solicitudes where SOLI_ID = " + strconv.Itoa(res.SoliID) + ") and ESACODIGO = " + Empresa

				ctxAux := context.Background()
				rowsAux, errAux := db.QueryContext(ctxAux, queryAux)

				xmlLogger.Trace(logs.InformacionLog{
					Query:   queryAux,
					Mensaje: "Query obtener unor correlativo y centro de consumo",
				})

				if errAux != nil {
					xmlLogger.Error(logs.InformacionLog{
						Query:   queryAux,
						Mensaje: "Se cayo query obtener unor correlativo y centro de consumo",
						Error:   errAux,
					})
					return FOLIO
				}
				defer rowsAux.Close()
				for rowsAux.Next() {
					errAux := rowsAux.Scan(&CentroConsumo, &CentroCosto)
					if errAux != nil {
						xmlLogger.Error(logs.InformacionLog{
							Mensaje: "Se cayo scan obtener unor correlativo y centro de consumo",
							Error:   errAux,
						})
						return FOLIO
					}
				}
				MfdeIDaux := "0"
				queryAux = ""
				queryAux = " select nvl(mfde_referencia_contable, 0), mfde_id "
				queryAux = queryAux + " from clin_far_movimdet "
				queryAux = queryAux + " where  mfde_tipo_mov IN (150) "
				queryAux = queryAux + " and mfde_soli_id = " + strconv.Itoa(res.SoliID)
				queryAux = queryAux + " and mfde_mein_codmei = '" + ProductoCod + "'"
				queryAux = queryAux + " and MFDE_CANTIDAD >= '" + CantidadStock + "'"

				ctxAux = context.Background()
				rowsAux, errAux = db.QueryContext(ctxAux, queryAux)

				xmlLogger.Trace(logs.InformacionLog{
					Query:   queryAux,
					Mensaje: "Query obtener operacion de referencia",
				})

				if errAux != nil {
					xmlLogger.Error(logs.InformacionLog{
						Query:   queryAux,
						Mensaje: "Se cayo query obtener operacion de referencia",
						Error:   errAux,
					})
					return FOLIO
				}
				defer rowsAux.Close()
				for rowsAux.Next() {
					errAux := rowsAux.Scan(&OperacionConsumoRef, &MfdeIDaux)
					if errAux != nil {
						xmlLogger.Error(logs.InformacionLog{
							Mensaje: "Se cayo scan obtener operacion de referencia",
							Error:   errAux,
						})
						return FOLIO
					}
				}
			case 62:
				TipoProceso = "DEV" // DEVOLUCION
				ValorTotal = "0"
				if ReceID > "0" {
					TipoOperacion = "28"
				} else {
					TipoOperacion = "29"
				}
				TipoTransaccion = "1" // ENTRADA
				Ubicacion = UbicacionD
				BodegaOrigen = BodegaDestino
				BodegaDestino = "0"
				OperacionConsumoRef = "0"
				ValorTotal = "0"
				CentroConsumo = "0"
				CentroCosto = "0"
				queryAux := "select nvl(guo.centroconsumo, 0), nvl(guo.unor_correlativo,0) "
				queryAux = queryAux + "from glo_unidades_organizacionales guo "
				queryAux = queryAux + "where guo.cod_servicio = (select soli_codservicioactual from  "
				queryAux = queryAux + "clin_far_solicitudes where SOLI_ID = " + strconv.Itoa(res.SoliID) + ") and ESACODIGO = " + Empresa

				ctxAux := context.Background()
				rowsAux, errAux := db.QueryContext(ctxAux, queryAux)

				xmlLogger.Trace(logs.InformacionLog{
					Query:   queryAux,
					Mensaje: "Query obtener unor correlativo y centro de consumo",
				})

				if errAux != nil {
					xmlLogger.Error(logs.InformacionLog{
						Query:   queryAux,
						Mensaje: "Se cayo query obtener unor correlativo y centro de consumo",
						Error:   errAux,
					})
					return FOLIO
				}
				defer rowsAux.Close()
				for rowsAux.Next() {
					errAux := rowsAux.Scan(&CentroConsumo, &CentroCosto)
					if errAux != nil {
						xmlLogger.Error(logs.InformacionLog{
							Mensaje: "Se cayo scan obtener unor correlativo y centro de consumo",
							Error:   errAux,
						})
						return FOLIO
					}
				}
				MfdeIDaux := "0"
				queryAux = ""
				queryAux = " select nvl(mfde_referencia_contable, 0), mfde_id "
				queryAux = queryAux + " from clin_far_movimdet "
				queryAux = queryAux + " where  mfde_tipo_mov IN (160) "
				queryAux = queryAux + " and mfde_soli_id = " + strconv.Itoa(res.SoliID)
				queryAux = queryAux + " and mfde_mein_codmei = '" + ProductoCod + "'"
				queryAux = queryAux + " and MFDE_CANTIDAD >= '" + CantidadStock + "'"

				ctxAux = context.Background()
				rowsAux, errAux = db.QueryContext(ctxAux, queryAux)

				xmlLogger.Trace(logs.InformacionLog{
					Query:   queryAux,
					Mensaje: "Query obtener operacion de referencia",
				})

				if errAux != nil {
					xmlLogger.Error(logs.InformacionLog{
						Query:   queryAux,
						Mensaje: "Se cayo query obtener operacion de referencia",
						Error:   errAux,
					})
					return FOLIO
				}
				defer rowsAux.Close()
				for rowsAux.Next() {
					errAux := rowsAux.Scan(&OperacionConsumoRef, &MfdeIDaux)
					if errAux != nil {
						xmlLogger.Error(logs.InformacionLog{
							Mensaje: "Se cayo scan obtener operacion de referencia",
							Error:   errAux,
						})
						return FOLIO
					}
				}
			case 63:
				TipoProceso = "DEV" // DEVOLUCION
				ValorTotal = "0"
				if ReceID > "0" {
					TipoOperacion = "28"
				} else {
					TipoOperacion = "29"
				}
				TipoTransaccion = "1" // ENTRADA
				Ubicacion = UbicacionD
				BodegaOrigen = BodegaDestino
				BodegaDestino = "0"
				OperacionConsumoRef = "0"
				ValorTotal = "0"
				CentroConsumo = "0"
				CentroCosto = "0"
				queryAux := "select nvl(guo.centroconsumo, 0), nvl(guo.unor_correlativo,0) "
				queryAux = queryAux + "from glo_unidades_organizacionales guo "
				queryAux = queryAux + "where guo.cod_servicio = (select soli_codservicioactual from  "
				queryAux = queryAux + "clin_far_solicitudes where SOLI_ID = " + strconv.Itoa(res.SoliID) + ") and ESACODIGO = " + Empresa

				ctxAux := context.Background()
				rowsAux, errAux := db.QueryContext(ctxAux, queryAux)

				xmlLogger.Trace(logs.InformacionLog{
					Query:   queryAux,
					Mensaje: "Query obtener unor correlativo y centro de consumo",
				})

				if errAux != nil {
					xmlLogger.Error(logs.InformacionLog{
						Query:   queryAux,
						Mensaje: "Se cayo query obtener unor correlativo y centro de consumo",
						Error:   errAux,
					})
					return 0
				}
				defer rowsAux.Close()
				for rowsAux.Next() {
					errAux := rowsAux.Scan(&CentroConsumo, &CentroCosto)
					if errAux != nil {
						xmlLogger.Error(logs.InformacionLog{
							Mensaje: "Se cayo scan obtener unor correlativo y centro de consumo",
							Error:   errAux,
						})
						return FOLIO
					}
				}
				MfdeIDaux := "0"
				queryAux = ""
				queryAux = " select nvl(mfde_referencia_contable, 0), mfde_id "
				queryAux = queryAux + " from clin_far_movimdet "
				queryAux = queryAux + " where  mfde_tipo_mov IN (140) "
				queryAux = queryAux + " and mfde_soli_id = " + strconv.Itoa(res.SoliID)
				queryAux = queryAux + " and mfde_mein_codmei = '" + ProductoCod + "'"
				queryAux = queryAux + " and MFDE_CANTIDAD >= '" + CantidadStock + "'"

				ctxAux = context.Background()
				rowsAux, errAux = db.QueryContext(ctxAux, queryAux)

				xmlLogger.Trace(logs.InformacionLog{
					Query:   queryAux,
					Mensaje: "Query obtener operacion de referencia",
				})

				if errAux != nil {
					xmlLogger.Error(logs.InformacionLog{
						Query:   queryAux,
						Mensaje: "Se cayo query obtener operacion de referencia",
						Error:   errAux,
					})
					return FOLIO
				}
				defer rowsAux.Close()
				for rowsAux.Next() {
					errAux := rowsAux.Scan(&OperacionConsumoRef, &MfdeIDaux)
					if errAux != nil {
						xmlLogger.Error(logs.InformacionLog{
							Mensaje: "Se cayo scan obtener operacion de referencia",
							Error:   errAux,
						})
						return FOLIO
					}
				}
			case 5:
				TipoProceso = "DEV" // DEVOLUCION
				TipoOperacion = "22"
				TipoTransaccion = "1" // ENTRADA
				BodegaOrigen = BodegaDestinoAux
				BodegaDestino = "0"
				OperacionConsumoRef = "0"
				Ubicacion = UbicacionO
				ValorTotal = "0"
				queryAux := "select nvl(guo.centroconsumo, 0), nvl(guo.unor_correlativo,0) "
				queryAux = queryAux + "from glo_unidades_organizacionales guo "
				queryAux = queryAux + "where guo.cod_servicio = (select soli_codservicioactual from  "
				queryAux = queryAux + "clin_far_solicitudes where SOLI_ID = " + strconv.Itoa(res.SoliID) + ") and ESACODIGO = " + Empresa

				ctxAux := context.Background()
				rowsAux, errAux := db.QueryContext(ctxAux, queryAux)

				xmlLogger.Trace(logs.InformacionLog{
					Query:   queryAux,
					Mensaje: "Query obtener unor correlativo y centro de consumo",
				})

				if errAux != nil {
					xmlLogger.Error(logs.InformacionLog{
						Query:   queryAux,
						Mensaje: "Se cayo query obtener unor correlativo y centro de consumo",
						Error:   errAux,
					})
					return FOLIO
				}
				defer rowsAux.Close()
				for rowsAux.Next() {
					errAux := rowsAux.Scan(&CentroConsumo, &CentroCosto)
					if errAux != nil {
						xmlLogger.Error(logs.InformacionLog{
							Mensaje: "Se cayo scan obtener unor correlativo y centro de consumo",
							Error:   errAux,
						})
						return FOLIO
					}
				}
				MfdeIDaux := "0"
				queryAux = ""
				queryAux = " select nvl(mfde_referencia_contable, 0), mfde_id "
				queryAux = queryAux + " from clin_far_movimdet "
				queryAux = queryAux + " where  mfde_tipo_mov IN (105) "
				queryAux = queryAux + " and mfde_soli_id = " + strconv.Itoa(res.SoliID)
				queryAux = queryAux + " and mfde_mein_codmei = '" + ProductoCod + "'"
				queryAux = queryAux + " and MFDE_CANTIDAD >= '" + CantidadStock + "'"

				ctxAux = context.Background()
				rowsAux, errAux = db.QueryContext(ctxAux, queryAux)

				xmlLogger.Trace(logs.InformacionLog{
					Query:   queryAux,
					Mensaje: "Query obtener operacion de referencia",
				})

				if errAux != nil {
					xmlLogger.Error(logs.InformacionLog{
						Query:   queryAux,
						Mensaje: "Se cayo query obtener operacion de referencia",
						Error:   errAux,
					})
					return FOLIO
				}
				defer rowsAux.Close()
				for rowsAux.Next() {
					errAux := rowsAux.Scan(&OperacionConsumoRef, &MfdeIDaux)
					if errAux != nil {
						xmlLogger.Error(logs.InformacionLog{
							Mensaje: "Se cayo scan obtener operacion de referencia",
							Error:   errAux,
						})
						return FOLIO
					}
				}
			case 410:
				TipoProceso = "DEV" // DEVOLUCION
				ValorTotal = "0"
				if ReceID > "0" {
					TipoOperacion = "28"
				} else {
					TipoOperacion = "29"
				}
				TipoTransaccion = "1" // ENTRADA
				Ubicacion = UbicacionD
				BodegaOrigen = BodegaDestino
				BodegaDestino = "0"
				OperacionConsumoRef = "0"
				ValorTotal = "0"
				CentroConsumo = "0"
				CentroCosto = "0"
				GlosaOperacion = "ANULACION DESPACHO RECETA PACIENTE AMBULATORIO"
				queryAux := "select nvl(guo.centroconsumo, 0), nvl(guo.unor_correlativo,0) "
				queryAux = queryAux + "from glo_unidades_organizacionales guo "
				queryAux = queryAux + "where guo.cod_servicio = (select soli_codservicioactual from  "
				queryAux = queryAux + "clin_far_solicitudes where SOLI_ID = " + strconv.Itoa(res.SoliID) + ") and ESACODIGO = " + Empresa

				ctxAux := context.Background()
				rowsAux, errAux := db.QueryContext(ctxAux, queryAux)

				xmlLogger.Trace(logs.InformacionLog{
					Query:   queryAux,
					Mensaje: "Query obtener unor correlativo y centro de consumo",
				})

				if errAux != nil {
					xmlLogger.Error(logs.InformacionLog{
						Query:   queryAux,
						Mensaje: "Se cayo query obtener unor correlativo y centro de consumo",
						Error:   errAux,
					})
					return FOLIO
				}
				defer rowsAux.Close()
				for rowsAux.Next() {
					errAux := rowsAux.Scan(&CentroConsumo, &CentroCosto)
					if errAux != nil {
						xmlLogger.Error(logs.InformacionLog{
							Mensaje: "Se cayo scan obtener unor correlativo y centro de consumo",
							Error:   errAux,
						})
						return FOLIO
					}
				}
				MfdeIDaux := "0"
				queryAux = ""
				queryAux = " select nvl(mfde_referencia_contable, 0), mfde_id "
				queryAux = queryAux + " from clin_far_movimdet "
				queryAux = queryAux + " where  mfde_tipo_mov IN (150) "
				queryAux = queryAux + " and mfde_soli_id = " + strconv.Itoa(res.SoliID)
				queryAux = queryAux + " and mfde_mein_codmei = '" + ProductoCod + "'"
				queryAux = queryAux + " and MFDE_CANTIDAD >= '" + CantidadStock + "'"

				ctxAux = context.Background()
				rowsAux, errAux = db.QueryContext(ctxAux, queryAux)

				xmlLogger.Trace(logs.InformacionLog{
					Query:   queryAux,
					Mensaje: "Query obtener operacion de referencia",
				})

				if errAux != nil {
					xmlLogger.Error(logs.InformacionLog{
						Query:   queryAux,
						Mensaje: "Se cayo query obtener operacion de referencia",
						Error:   errAux,
					})
					return FOLIO
				}
				defer rowsAux.Close()
				for rowsAux.Next() {
					errAux := rowsAux.Scan(&OperacionConsumoRef, &MfdeIDaux)
					if errAux != nil {
						xmlLogger.Error(logs.InformacionLog{
							Mensaje: "Se cayo scan obtener operacion de referencia",
							Error:   errAux,
						})
						return FOLIO
					}
				}
			case 420:
				TipoProceso = "DEV" // DEVOLUCION
				ValorTotal = "0"
				if ReceID > "0" {
					TipoOperacion = "28"
				} else {
					TipoOperacion = "29"
				}
				TipoTransaccion = "1" // ENTRADA
				Ubicacion = UbicacionD
				BodegaOrigen = BodegaDestino
				BodegaDestino = "0"
				OperacionConsumoRef = "0"
				ValorTotal = "0"
				CentroConsumo = "0"
				CentroCosto = "0"
				GlosaOperacion = "ANULACION DESPACHO RECETA PACIENTE URGENCIA"
				queryAux := "select nvl(guo.centroconsumo, 0), nvl(guo.unor_correlativo,0) "
				queryAux = queryAux + "from glo_unidades_organizacionales guo "
				queryAux = queryAux + "where guo.cod_servicio = (select soli_codservicioactual from  "
				queryAux = queryAux + "clin_far_solicitudes where SOLI_ID = " + strconv.Itoa(res.SoliID) + ") and ESACODIGO = " + Empresa

				ctxAux := context.Background()
				rowsAux, errAux := db.QueryContext(ctxAux, queryAux)
				xmlLogger.Trace(logs.InformacionLog{
					Query:   queryAux,
					Mensaje: "Query obtener unor correlativo y centro de consumo",
				})

				if errAux != nil {
					xmlLogger.Error(logs.InformacionLog{
						Query:   queryAux,
						Mensaje: "Se cayo query obtener unor correlativo y centro de consumo",
						Error:   errAux,
					})
					return 0
				}
				defer rowsAux.Close()
				for rowsAux.Next() {
					errAux := rowsAux.Scan(&CentroConsumo, &CentroCosto)
					if errAux != nil {
						xmlLogger.Error(logs.InformacionLog{
							Mensaje: "Se cayo scan obtener unor correlativo y centro de consumo",
							Error:   errAux,
						})
						return FOLIO
					}
				}
				MfdeIDaux := "0"
				queryAux = ""
				queryAux = " select nvl(mfde_referencia_contable, 0), mfde_id "
				queryAux = queryAux + " from clin_far_movimdet "
				queryAux = queryAux + " where  mfde_tipo_mov IN (160) "
				queryAux = queryAux + " and mfde_soli_id = " + strconv.Itoa(res.SoliID)
				queryAux = queryAux + " and mfde_mein_codmei = '" + ProductoCod + "'"
				queryAux = queryAux + " and MFDE_CANTIDAD >= '" + CantidadStock + "'"

				ctxAux = context.Background()
				rowsAux, errAux = db.QueryContext(ctxAux, queryAux)

				xmlLogger.Trace(logs.InformacionLog{
					Query:   queryAux,
					Mensaje: "Query obtener unor correlativo y centro de consumo",
				})

				if errAux != nil {
					xmlLogger.Error(logs.InformacionLog{
						Query:   queryAux,
						Mensaje: "Se cayo query obtener unor correlativo y centro de consumo",
						Error:   errAux,
					})
					return FOLIO
				}
				defer rowsAux.Close()
				for rowsAux.Next() {
					errAux := rowsAux.Scan(&OperacionConsumoRef, &MfdeIDaux)
					if errAux != nil {
						xmlLogger.Error(logs.InformacionLog{
							Mensaje: "Se cayo scan obtener unor correlativo y centro de consumo",
							Error:   errAux,
						})
						return FOLIO
					}
				}
			case 430:
				TipoProceso = "DEV" // DEVOLUCION
				ValorTotal = "0"
				if ReceID > "0" {
					TipoOperacion = "28"
				} else {
					TipoOperacion = "29"
				}
				TipoTransaccion = "1" // ENTRADA
				Ubicacion = UbicacionD
				BodegaOrigen = BodegaDestino
				BodegaDestino = "0"
				OperacionConsumoRef = "0"
				ValorTotal = "0"
				CentroConsumo = "0"
				CentroCosto = "0"
				GlosaOperacion = "ANULACION DESPACHO RECETA PACIENTE HOSPITALARIO"
				queryAux := "select nvl(guo.centroconsumo, 0), nvl(guo.unor_correlativo,0) "
				queryAux = queryAux + "from glo_unidades_organizacionales guo "
				queryAux = queryAux + "where guo.cod_servicio = (select soli_codservicioactual from  "
				queryAux = queryAux + "clin_far_solicitudes where SOLI_ID = " + strconv.Itoa(res.SoliID) + ") and ESACODIGO = " + Empresa

				ctxAux := context.Background()
				rowsAux, errAux := db.QueryContext(ctxAux, queryAux)

				xmlLogger.Trace(logs.InformacionLog{
					Query:   queryAux,
					Mensaje: "Query obtener unor correlativo y centro de consumo",
				})

				if errAux != nil {
					xmlLogger.Error(logs.InformacionLog{
						Query:   queryAux,
						Mensaje: "Se cayo query obtener unor correlativo y centro de consumo",
						Error:   errAux,
					})
					return FOLIO
				}
				defer rowsAux.Close()
				for rowsAux.Next() {
					errAux := rowsAux.Scan(&CentroConsumo, &CentroCosto)
					if errAux != nil {
						xmlLogger.Error(logs.InformacionLog{
							Mensaje: "Se cayo scan obtener unor correlativo y centro de consumo",
							Error:   errAux,
						})
						return FOLIO
					}
				}
				MfdeIDaux := "0"
				queryAux = ""
				queryAux = " select nvl(mfde_referencia_contable, 0), mfde_id "
				queryAux = queryAux + " from clin_far_movimdet "
				queryAux = queryAux + " where  mfde_tipo_mov IN (140) "
				queryAux = queryAux + " and mfde_soli_id = " + strconv.Itoa(res.SoliID)
				queryAux = queryAux + " and mfde_mein_codmei = '" + ProductoCod + "'"
				queryAux = queryAux + " and MFDE_CANTIDAD >= '" + CantidadStock + "'"

				ctxAux = context.Background()
				rowsAux, errAux = db.QueryContext(ctxAux, queryAux)

				xmlLogger.Trace(logs.InformacionLog{
					Query:   queryAux,
					Mensaje: "Query obtener operacion de referencia",
				})

				if errAux != nil {
					xmlLogger.Error(logs.InformacionLog{
						Query:   queryAux,
						Mensaje: "Se cayo query obtener operacion de referencia",
						Error:   errAux,
					})
					return FOLIO
				}
				defer rowsAux.Close()
				for rowsAux.Next() {
					errAux := rowsAux.Scan(&OperacionConsumoRef, &MfdeIDaux)
					if errAux != nil {
						xmlLogger.Error(logs.InformacionLog{
							Mensaje: "Se cayo scan obtener operacion de referencia",
							Error:   errAux,
						})
						return FOLIO
					}
				}
			}

			// OperacionConsumoRef = "2487377"

			xmlLlamada.Body.GetResponseBody.GetResponse.Empresa = Empresa
			xmlLlamada.Body.GetResponseBody.GetResponse.Division = Division
			xmlLlamada.Body.GetResponseBody.GetResponse.Unidad = Unidad
			xmlLlamada.Body.GetResponseBody.GetResponse.FechaProceso = FechaProceso
			xmlLlamada.Body.GetResponseBody.GetResponse.BodegaOrigen = BodegaOrigen
			xmlLlamada.Body.GetResponseBody.GetResponse.BodegaDestino = BodegaDestino
			xmlLlamada.Body.GetResponseBody.GetResponse.TipoProceso = TipoProceso
			xmlLlamada.Body.GetResponseBody.GetResponse.TipoTransaccion = TipoTransaccion
			xmlLlamada.Body.GetResponseBody.GetResponse.RecepcionAutomatica = "0"
			xmlLlamada.Body.GetResponseBody.GetResponse.OperacionConsumoRef = OperacionConsumoRef
			xmlLlamada.Body.GetResponseBody.GetResponse.TipoOperacion = TipoOperacion
			xmlLlamada.Body.GetResponseBody.GetResponse.UsuarioProceso = UsuarioProceso
			xmlLlamada.Body.GetResponseBody.GetResponse.GlosaOperacion = GlosaOperacion
			xmlLlamada.Body.GetResponseBody.GetResponse.CentroConsumo = CentroConsumo
			xmlLlamada.Body.GetResponseBody.GetResponse.Rut = " "
			xmlLlamada.Body.GetResponseBody.GetResponse.TipoDocumento = "0"
			xmlLlamada.Body.GetResponseBody.GetResponse.FolioDocumento = "0"
			xmlLlamada.Body.GetResponseBody.GetResponse.FechaDocumento = FechaDocumento
			xmlLlamada.Body.GetResponseBody.GetResponse.NroRefExterno = NroRefExterno

			if indx == 1 {
				LineaDetFisico = Linea
				xmlDetAux.Linea = Linea
				xmlDetAux.ProductoCod = ProductoCod
				xmlDetAux.CantidadStock = CantidadStock
				xmlDetAux.Cantidad2 = Cantidad2
				xmlDetAux.ValorTotal = ValorTotal
				xmlDetAux.CentroCosto = CentroCosto
				xmlDetAux.ConceptoImp = ConceptoImp
				xmlDetAux.TipoProyecto = TipoProyecto
				xmlDetAux.NumeroProyecto = NumeroProyecto

				CantidadTotal = 0
				xmlDetAux.GetDetalleFisico.GetLineafisico = nil
			}
			CantAux, _ := strconv.Atoi(CantidadStock)
			CantidadTotal = CantidadTotal + CantAux
			xmlDetFisicoAux.Linea = LineaDetFisico
			xmlDetFisicoAux.CantidadStock = CantidadStock
			xmlDetFisicoAux.Cantidad2 = Cantidad2
			xmlDetFisicoAux.Ubicacion = Ubicacion
			xmlDetFisicoAux.NumeroLote = NumeroLote
			xmlDetFisicoAux.LoteFecExpiracion = LoteFecExpiracion
			xmlDetFisicoAux.NumeroSerie = NumeroSerie
			xmlDetFisicoAux.Rotulo = " "
			xmlDetFisicoAux.Rotulo2 = " "

			xmlDetAux.GetDetalleFisico.GetLineafisico = append(xmlDetAux.GetDetalleFisico.GetLineafisico, xmlDetFisicoAux)
			if indx == Cant {
				xmlDetAux.CantidadStock = strconv.Itoa(CantidadTotal)
				indx = 0
				xmlLlamada.Body.GetResponseBody.GetResponse.GetDetalleOperacion.GetLineaDetalle = append(xmlLlamada.Body.GetResponseBody.GetResponse.GetDetalleOperacion.GetLineaDetalle, xmlDetAux)
			}
			transaccion = 1
		}
		if transaccion == 1 {
			client := &http.Client{}
			data, err := xml.Marshal(xmlLlamada)
			if err != nil {
				xmlLogger.Error(logs.InformacionLog{
					Mensaje: "Error Marshal de XML",
					Error:   err,
				})
				return FOLIO
			}
			if res.SoliID != 0 {
				xmlLogger.Info(logs.InformacionLog{
					Mensaje: "Body XML : Solicitud " + strconv.Itoa(res.SoliID) + " " + string(data),
					Contexto: map[string]interface{}{
						"xml":       string(data),
						"solicitud": res.SoliID,
					},
				})
			} else {
				xmlLogger.Info(logs.InformacionLog{
					Mensaje: "Body XML : Agrupador " + strconv.Itoa(res.IDAgrupador) + " " + string(data),
					Contexto: map[string]interface{}{
						"xml":       string(data),
						"agrupador": res.IDAgrupador,
					},
				})
			}

			req, err := http.NewRequest(MethodPost, url, bytes.NewBuffer(data))
			if err != nil {
				xmlLogger.Warn(logs.InformacionLog{
					Mensaje: "No puede crear request",
					Error:   err,
				})
				return FOLIO
			}
			req.Header.Add("Content-Type", "text/xml; charset=utf-8")
			resXML, err := client.Do(req)
			if err != nil {
				xmlLogger.Warn(logs.InformacionLog{
					Mensaje: "Fallo envio de XML",
					Error:   err,
				})
				return FOLIO
			}

			defer resXML.Body.Close()
			bodyRetornado, err := ioutil.ReadAll(resXML.Body)
			if err != nil {
				xmlLogger.Warn(logs.InformacionLog{
					Mensaje: "Error al leer cuerpo de respuesta",
					Error:   err,
				})
				return FOLIO
			}

			var myEnv models.MyRespEnvelope
			xml.Unmarshal(bodyRetornado, &myEnv)

			if res.SoliID != 0 {
				xmlLogger.Info(logs.InformacionLog{
					Mensaje: "Body bodyRetornado : Solicitud " + strconv.Itoa(res.SoliID) + " " + string(bodyRetornado),
					Contexto: map[string]interface{}{
						"xml":       string(bodyRetornado),
						"solicitud": res.SoliID,
					},
				})
			} else {
				xmlLogger.Info(logs.InformacionLog{
					Mensaje: "Body bodyRetornado : Agrupador " + strconv.Itoa(res.IDAgrupador) + " " + string(bodyRetornado),
					Contexto: map[string]interface{}{
						"xml":       string(bodyRetornado),
						"agrupador": res.IDAgrupador,
					},
				})
			}

			mensageAux = ""
			resultado := myEnv.Body.GetResponse.GetResult
			// estadoRslt = resultado.EstadoResultado
			// estadoRslt = resultado.CodError
			retornoValores := resultado.Folio
			reproceso := false
			if len(resultado.DetalleCodigoError.DetalleCodigo) > 0 {
				IDAgrupador := 0
				IDAgrupadorMovDev := 0
				switch TipoMovim {
				case "NORMAL":
					IDAgrupador, err = GeneraSecidAgrupador(res.Servidor)
					if err != nil {
						xmlLogger.Error(logs.InformacionLog{
							Mensaje: "Fallo GeneraSecidAgrupador",
							Error:   err,
						})
						return FOLIO
					}
				case "DEVOLUCION":
					IDAgrupadorMovDev = GeneraSecidAgrupadorMovDev(res.Servidor)
				}
				for _, element := range resultado.DetalleCodigoError.DetalleCodigo {
					reproceso = true
					switch TipoMovim {
					case "NORMAL":
						queryUpdate = "update clin_far_movimdet "
						queryUpdate = queryUpdate + "set mfde_referencia_contable = NVL(mfde_referencia_contable,0) "
						queryUpdate = queryUpdate + ",int_erp_estado = 'OBSERVADO' "
						queryUpdate = queryUpdate + ",MFDE_AGRUPADOR_ID = " + strconv.Itoa(IDAgrupador)
						queryUpdate = queryUpdate + ",int_erp_fecha = (to_date(to_char(sysdate,'DD/MM/YYYY'),'DD/MM/YYYY'))"
						queryUpdate = queryUpdate + ",INT_ERP_ERROR = SUBSTR('" + element.Observacion + " ',0,255)"
						queryUpdate = queryUpdate + "  WHERE int_erp_estado <> 'TRASPASADO' AND int_erp_error <> 'EXITO' "
						queryUpdate = queryUpdate + "  AND MFDE_MEIN_CODMEI = TRIM('" + element.ProductoCod + "') "
						if res.SoliID > 0 {
							queryUpdate = queryUpdate + " AND MFDE_SOLI_ID = " + strconv.Itoa(res.SoliID)
						}
						if res.NumeroMovimiento > 0 {
							queryUpdate = queryUpdate + " and mfde_id = " + strconv.Itoa(res.NumeroMovimiento)
						}
						if res.IDAgrupador > 0 {
							queryUpdate = queryUpdate + " and MFDE_AGRUPADOR_ID = " + strconv.Itoa(res.IDAgrupador)
						}
						queryUpdate = queryUpdate + " AND MFDE_TIPO_MOV = " + strconv.Itoa(Tipo)

						tabla = "clin_far_movimdet"
					case "DEVOLUCION":
						queryUpdate = "update clin_far_movim_devol "
						queryUpdate = queryUpdate + "set MDEV_REFERENCIA_CONTABLE = NVL(" + resultado.Folio + ", 0 )"
						queryUpdate = queryUpdate + ",int_erp_estado = 'OBSERVADO' "
						queryUpdate = queryUpdate + ",MDEV_AGRUPADOR_ID = " + strconv.Itoa(IDAgrupadorMovDev)
						queryUpdate = queryUpdate + ",int_erp_fecha = (to_date(to_char(sysdate,'DD/MM/YYYY'),'DD/MM/YYYY'))"
						queryUpdate = queryUpdate + ",INT_ERP_ERROR = SUBSTR('" + element.Observacion + " ',0,255)"
						queryUpdate = queryUpdate + "  WHERE int_erp_estado <> 'TRASPASADO' AND int_erp_error <> 'EXITO' "
						queryUpdate = queryUpdate + "  AND MDEV_ID = " + mdetID
						if res.SoliID > 0 {
							queryUpdate = queryUpdate + " AND MDEV_SOLI_ID = " + strconv.Itoa(res.SoliID)
						}
						if res.NumeroMovimiento > 0 {
							queryUpdate = queryUpdate + " and mdev_id = " + strconv.Itoa(res.NumeroMovimiento)
						}
						if res.IDAgrupador > 0 {
							queryUpdate = queryUpdate + " and MDEV_AGRUPADOR_ID = " + strconv.Itoa(res.IDAgrupador)
						}
						queryUpdate = queryUpdate + " AND MDEV_MOVF_TIPO = " + strconv.Itoa(Tipo)

						tabla = "clin_far_movim_devol"
					}
					ctxUpdate := context.Background()
					rowUpdate, errUpdate := db.QueryContext(ctxUpdate, queryUpdate)

					xmlLogger.Trace(logs.InformacionLog{
						Query:   queryUpdate,
						Mensaje: fmt.Sprintf("Query update de tabla \"%s\"", tabla),
					})

					if errUpdate != nil {
						xmlLogger.Error(logs.InformacionLog{
							Query:   queryUpdate,
							Mensaje: fmt.Sprintf("Se cayo query update de tabla \"%s\"", tabla),
							Error:   errUpdate,
						})
						return FOLIO
					}
					defer rowUpdate.Close()
				}
			} else {
				if retornoValores == "0" {
					for _, campo := range resultado.Mensajes.MensajeNxt {
						mensageAux = mensageAux + campo.Message
					}
					switch TipoMovim {
					case "NORMAL":
						queryUpdate = "update clin_far_movimdet "
						queryUpdate = queryUpdate + "set mfde_referencia_contable = NVL(mfde_referencia_contable,0) "
						queryUpdate = queryUpdate + ",int_erp_estado = 'OBSERVADO' "
						queryUpdate = queryUpdate + ",int_erp_fecha = (to_date(to_char(sysdate,'DD/MM/YYYY'),'DD/MM/YYYY'))"
						queryUpdate = queryUpdate + ",INT_ERP_ERROR = SUBSTR('" + mensageAux + " ',0,255)"
						queryUpdate = queryUpdate + "  WHERE int_erp_estado <> 'TRASPASADO' AND int_erp_error <> 'EXITO' "
						if res.SoliID > 0 {
							queryUpdate = queryUpdate + " AND MFDE_SOLI_ID = " + strconv.Itoa(res.SoliID)
						}
						if res.NumeroMovimiento > 0 {
							queryUpdate = queryUpdate + " and mfde_id = " + strconv.Itoa(res.NumeroMovimiento)
						}
						if res.IDAgrupador > 0 {
							queryUpdate = queryUpdate + " and MFDE_AGRUPADOR_ID = " + strconv.Itoa(res.IDAgrupador)
						}
						queryUpdate = queryUpdate + " AND MFDE_TIPO_MOV = " + strconv.Itoa(Tipo)

						tabla = "clin_far_movimdet"
					case "DEVOLUCION":
						queryUpdate = "update clin_far_movim_devol "
						queryUpdate = queryUpdate + "set MDEV_REFERENCIA_CONTABLE = NVL(" + resultado.Folio + ", 0 )"
						queryUpdate = queryUpdate + ",int_erp_estado = 'OBSERVADO' "
						queryUpdate = queryUpdate + ",int_erp_fecha = (to_date(to_char(sysdate,'DD/MM/YYYY'),'DD/MM/YYYY'))"
						queryUpdate = queryUpdate + ",INT_ERP_ERROR = SUBSTR('" + mensageAux + " ',0,255)"
						queryUpdate = queryUpdate + "  WHERE int_erp_estado <> 'TRASPASADO' AND int_erp_error <> 'EXITO' "
						if res.SoliID > 0 {
							queryUpdate = queryUpdate + " AND MDEV_SOLI_ID = " + strconv.Itoa(res.SoliID)
						}
						if res.NumeroMovimiento > 0 {
							queryUpdate = queryUpdate + " and mdev_id = " + strconv.Itoa(res.NumeroMovimiento)
						}
						if res.IDAgrupador > 0 {
							queryUpdate = queryUpdate + " and MDEV_AGRUPADOR_ID = " + strconv.Itoa(res.IDAgrupador)
						}
						queryUpdate = queryUpdate + " AND MDEV_MOVF_TIPO = " + strconv.Itoa(Tipo)

						tabla = "clin_far_movim_devol"
					}
					ctxUpdate := context.Background()
					rowUpdate, errUpdate := db.QueryContext(ctxUpdate, queryUpdate)

					xmlLogger.Trace(logs.InformacionLog{
						Query:   queryUpdate,
						Mensaje: fmt.Sprintf("Query update de tabla \"%s\"", tabla),
					})

					if errUpdate != nil {
						xmlLogger.Error(logs.InformacionLog{
							Query:   queryUpdate,
							Mensaje: fmt.Sprintf("Se cayo query update de tabla \"%s\"", tabla),
							Error:   errUpdate,
						})
						return FOLIO
					}
					defer rowUpdate.Close()
				}
			}

			if retornoValores != "0" {
				switch TipoMovim {
				case "NORMAL":
					FOLIO, _ = strconv.Atoi(resultado.Folio)
					queryUpdate = "update clin_far_movimdet "
					queryUpdate = queryUpdate + "set mfde_referencia_contable = NVL(" + resultado.Folio + ", 0 )"
					queryUpdate = queryUpdate + ",int_erp_estado = 'TRASPASADO' "
					queryUpdate = queryUpdate + ",int_erp_fecha = (to_date(to_char(sysdate,'DD/MM/YYYY'),'DD/MM/YYYY'))"
					if res.TipoMovimiento == 100 {
						queryUpdate = queryUpdate + ",INT_ERP_ERROR = ' ' "
					} else {
						queryUpdate = queryUpdate + ",INT_ERP_ERROR = 'EXITO'"
					}
					queryUpdate = queryUpdate + ",MFDE_VALOR_COSTO_UNITARIO = " + ValorTotal
					queryUpdate = queryUpdate + "  WHERE int_erp_estado <> 'TRASPASADO' AND int_erp_error <> 'EXITO' "
					if res.SoliID > 0 {
						queryUpdate = queryUpdate + " AND MFDE_SOLI_ID = " + strconv.Itoa(res.SoliID)
					}
					if res.NumeroMovimiento > 0 {
						queryUpdate = queryUpdate + " and mfde_id = " + strconv.Itoa(res.NumeroMovimiento)
					}
					if res.IDAgrupador > 0 {
						queryUpdate = queryUpdate + " and MFDE_AGRUPADOR_ID = " + strconv.Itoa(res.IDAgrupador)
					}
					if res.ReferenciaDesp > 0 {
						queryUpdate = queryUpdate + "     and MFDE_REF_DESPACHO = " + strconv.Itoa(res.ReferenciaDesp) + " "
					}
					queryUpdate = queryUpdate + " AND MFDE_TIPO_MOV = " + strconv.Itoa(Tipo)
					if res.SobreGiro {
						queryUpdate = queryUpdate + " and int_erp_error not like ('%sobregiro%') "
						queryUpdate = queryUpdate + " and int_erp_error not like ('%saldo%') "
					}
					if OperacionConsumoRef != "0" {
						queryUpdateOr := "update clin_far_movimdet "
						queryUpdateOr = queryUpdateOr + "set INT_ERP_ERROR = " + resultado.Folio
						queryUpdateOr = queryUpdateOr + "  WHERE mfde_referencia_contable = " + OperacionConsumoRef
						queryUpdateOr = queryUpdateOr + " AND MFDE_TIPO_MOV IN (102,100)"
						ctxUpdateOp := context.Background()
						rowUpdateOr, errUpdateOr := db.QueryContext(ctxUpdateOp, queryUpdateOr)

						xmlLogger.Trace(logs.InformacionLog{
							Query:   queryUpdateOr,
							Mensaje: fmt.Sprintf("Query update de tabla \"%s\"", tabla),
						})

						if errUpdateOr != nil {
							xmlLogger.Error(logs.InformacionLog{
								Query:   queryUpdateOr,
								Mensaje: fmt.Sprintf("Se cayo query update de tabla \"%s\"", tabla),
								Error:   errUpdateOr,
							})
							return FOLIO
						}
						defer rowUpdateOr.Close()
					}
					tabla = "clin_far_movimdet"
				case "DEVOLUCION":
					FOLIO, _ = strconv.Atoi(resultado.Folio)
					queryUpdate = "update clin_far_movim_devol "
					queryUpdate = queryUpdate + "set MDEV_REFERENCIA_CONTABLE = NVL(" + resultado.Folio + ", 0 )"
					queryUpdate = queryUpdate + ",int_erp_estado = 'TRASPASADO' "
					queryUpdate = queryUpdate + ",int_erp_fecha = (to_date(to_char(sysdate,'DD/MM/YYYY'),'DD/MM/YYYY'))"
					queryUpdate = queryUpdate + ",INT_ERP_ERROR = 'EXITO' "
					queryUpdate = queryUpdate + "  WHERE int_erp_estado <> 'TRASPASADO' AND int_erp_error <> 'EXITO' "
					if res.SoliID > 0 {
						queryUpdate = queryUpdate + " AND MDEV_SOLI_ID = " + strconv.Itoa(res.SoliID)
					}
					if res.NumeroMovimiento > 0 {
						queryUpdate = queryUpdate + " and mdev_id = " + strconv.Itoa(res.NumeroMovimiento)
					}
					if res.IDAgrupador > 0 {
						queryUpdate = queryUpdate + " and MDEV_AGRUPADOR_ID = " + strconv.Itoa(res.IDAgrupador)
					}
					queryUpdate = queryUpdate + " AND MDEV_MOVF_TIPO = " + strconv.Itoa(Tipo)
					if res.SobreGiro {
						queryUpdate = queryUpdate + " and int_erp_error not like ('%sobregiro%') "
						queryUpdate = queryUpdate + " and int_erp_error not like ('%saldo%') "
					}
					tabla = "clin_far_movim_devol"
				}
			}

			ctxUpdate := context.Background()
			rowUpdate, errUpdate := db.QueryContext(ctxUpdate, queryUpdate)

			xmlLogger.Trace(logs.InformacionLog{
				Query:   queryUpdate,
				Mensaje: fmt.Sprintf("Query update de tabla \"%s\"", tabla),
			})

			if errUpdate != nil {
				xmlLogger.Error(logs.InformacionLog{
					Query:   queryUpdate,
					Mensaje: fmt.Sprintf("Se cayo query update de tabla \"%s\"", tabla),
					Error:   errUpdate,
				})
				return FOLIO
			}
			defer rowUpdate.Close()

			if retornoValores != "0" {
				FOLIO, _ = strconv.Atoi(resultado.Folio)
				queryUpdate = "update clin_far_movim "
				queryUpdate = queryUpdate + "set INT_ERP_REFERENCIA = NVL(" + resultado.Folio + ", 0 )"
				queryUpdate = queryUpdate + ",int_erp_estado = 'TRASPASADO' "
				queryUpdate = queryUpdate + ",int_erp_fecha = (to_date(to_char(sysdate,'DD/MM/YYYY'),'DD/MM/YYYY'))"
				queryUpdate = queryUpdate + ",INT_ERP_ERROR = 'EXITO'"
				queryUpdate = queryUpdate + "  WHERE "
				if res.SoliID > 0 {
					queryUpdate = queryUpdate + " MOVF_SOLI_ID = " + strconv.Itoa(res.SoliID)
				} else {
					queryUpdate = queryUpdate + " MOVF_AGRUPADOR_ID = " + strconv.Itoa(res.IDAgrupador)
					queryUpdate = queryUpdate + " AND MOVF_TIPO = " + strconv.Itoa(Tipo)
				}
				if res.SobreGiro {
					queryUpdate = queryUpdate + " and int_erp_error not like ('%sobregiro%') "
					queryUpdate = queryUpdate + " and int_erp_error not like ('%saldo%') "
				}
				tabla = "clin_far_movim"
			} else {
				queryUpdate = "update clin_far_movim "
				queryUpdate = queryUpdate + "set INT_ERP_REFERENCIA = 0 "
				queryUpdate = queryUpdate + ",int_erp_estado = 'OBSERVADO' "
				queryUpdate = queryUpdate + ",int_erp_fecha = (to_date(to_char(sysdate,'DD/MM/YYYY'),'DD/MM/YYYY'))"
				queryUpdate = queryUpdate + ",INT_ERP_ERROR = SUBSTR('" + mensageAux + " ',0,999)"
				queryUpdate = queryUpdate + "  WHERE "
				if res.SoliID > 0 {
					queryUpdate = queryUpdate + " MOVF_SOLI_ID = " + strconv.Itoa(res.SoliID)
				} else {
					queryUpdate = queryUpdate + " MOVF_AGRUPADOR_ID = " + strconv.Itoa(res.IDAgrupador)
					queryUpdate = queryUpdate + " AND MOVF_TIPO = " + strconv.Itoa(Tipo)

				}
				// log.Println("res.SobreGiro : ", res.SobreGiro)
				if res.SobreGiro {
					queryUpdate = queryUpdate + " and int_erp_error not like ('%sobregiro%') "
					queryUpdate = queryUpdate + " and int_erp_error not like ('%saldo%') "
				}
				tabla = "clin_far_movim"
			}
			ctxUpdate = context.Background()
			rowUpdate, errUpdate = db.QueryContext(ctxUpdate, queryUpdate)

			xmlLogger.Trace(logs.InformacionLog{
				Query:   queryUpdate,
				Mensaje: fmt.Sprintf("Query update de tabla \"%s\"", tabla),
			})

			if errUpdate != nil {
				xmlLogger.Error(logs.InformacionLog{
					Query:   queryUpdate,
					Mensaje: fmt.Sprintf("Se cayo query update de tabla \"%s\"", tabla),
					Error:   errUpdate,
				})
				return FOLIO
			}
			defer rowUpdate.Close()
			if reproceso {
				SobreGiro := true

				xmlLogger.Info(logs.InformacionLog{
					Mensaje: "Reproceso",
					Contexto: map[string]interface{}{
						"sobreGiro":          SobreGiro,
						"inNumeromovimiento": inNumeromovimiento,
					},
				})

				if inNumeromovimiento < 10 {
					// Input data.
					FOLIO := 0
					SobreGiro := false
					inNumeromovimiento++

					var param models.ParamFin700Movimiento
					param.HdgCodigo = res.HdgCodigo
					param.TipoMovimiento = res.TipoMovimiento
					param.IDAgrupador = res.IDAgrupador
					param.NumeroMovimiento = res.NumeroMovimiento
					param.SoliID = res.SoliID
					param.Servidor = res.Servidor
					param.Usuario = res.Usuario
					param.SobreGiro = SobreGiro
					param.IntegraFin700, _ = paramg.ObtenerClinFarParamGeneral(db, "intFin700")
					param.DB = db
					if param.IntegraFin700 == "SI" {
						param.NumeroMovimiento = 0
						FOLIO = EnviarmovimientosFin702(param)
						xmlLogger.Trace(logs.InformacionLog{
							Mensaje:  "Envio exitoso FIN 702",
							Contexto: map[string]interface{}{"folio": FOLIO},
						})
					}
				}
			}
		}
	}
	return FOLIO
}
