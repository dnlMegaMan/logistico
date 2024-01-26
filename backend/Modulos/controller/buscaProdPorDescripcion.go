package controller

import (
	"context"
	"database/sql"
	"database/sql/driver"
	"encoding/json"
	ioutil "io"
	"net/http"
	"strconv"
	"strings"
	"time"

	. "github.com/godror/godror"
	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"

	. "sonda.com/logistico/Modulos/comun"
	"sonda.com/logistico/Modulos/models"
)

// BuscaProdPorDescripcion is...
func BuscaProdPorDescripcion(w http.ResponseWriter, r *http.Request) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	models.EnableCors(&w)
	w.Header().Set("Content-Type", "application/json")

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
	var msg models.ParamPorDescripcion
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

	res := models.ParamPorDescripcion{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.PiUsuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	start := time.Now()
	PiHDGCodi := res.PiHDGCodigo
	PiESACodi := res.PiESACodigo
	PiCMECodi := res.PiCMECodigo
	PiDesMed := res.PiDescripcion
	PiTipProd := res.PiTipoDeProducto

	models.EnableCors(&w)

	BodegaProductos := ""
	for index, element := range res.BodegaProductos {
		if index == 0 {
			BodegaProductos = strconv.Itoa(element.Meinid)
		} else {
			BodegaProductos = BodegaProductos + "," + strconv.Itoa(element.Meinid)
		}
	}

	db, _ := database.GetConnection(res.PiServidor)

	query := ""
	ctx := context.Background()
	retornoValores := []models.Medinsu{}
	valor, err := ObtenerClinFarParamGeneral(db, "usaPCKBusProPorDes")
	if err != nil {
		http.Error(w, "Error interno del servidor", http.StatusInternalServerError)
		logger.Error(logs.InformacionLog{
			Mensaje: "Error al obtener el valor del parámetro",
			Error:   err,
		})
		return
	}

	if valor == "SI" {
		var rowPKG driver.Rows

		logger.Trace(logs.InformacionLog{Mensaje: "Entro en la solución BuscaProdPorDescripcion"})

		transaccion, err := db.Begin()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "No puede crear transacción para devolver busqueda solicitud cabecera",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		qry := "BEGIN PKG_BUSCA_PROD_POR_DESCRIPCION.P_BUSCA_PROD_POR_DESCRIPCION(:1,:2,:3,:4,:5,:6,:7,:8,:9,:10,:11,:12,:13,:14,:15,:16,:17,:18,:19,:20,:21); END;"
		logger.Trace(logs.InformacionLog{
			Query:   qry,
			Mensaje: "Ejecución Package BUSCA PROD POR DESCRIPCION",
		})
		_, err = transaccion.Exec(qry,
			PlSQLArrays,
			res.IDBodega,             //:1
			PiHDGCodi,                //:2
			PiESACodi,                //:3
			PiCMECodi,                //:4
			res.PiProveedor,          //:5
			res.PiTipoDoc,            //:6
			res.PiNumdoc,             //:7
			res.PiPantalla,           //:8
			PiTipProd,                //:9
			PiDesMed,                 //:10
			res.PiPrincActivo,        //:11
			res.PiPresentacion,       //:12
			res.PiFormaFarma,         //:13
			res.PiCodigo,             //:14
			res.CLINUMIDENTIFICACION, //:15
			res.ControlMinimo,        //:16
			res.Controlado,           //:17
			res.Consignacion,         //:18
			BodegaProductos,          //:19
			res.CUM,                  //:20
			sql.Out{Dest: &rowPKG},   //:21
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   qry,
				Mensaje: "Fallo package BUSCA PROD POR DESCRIPCION",
				Error:   err,
				// Contexto: map[string]interface{}{
				// 	":1": res.FechaInicio, ":2": res.FechaTermino, ":3": res.IDBodegaSolicita, ":4": res.IDBodegaSuministro, ":5": res.IDArticulo,
				// },
			})

			errRollback := transaccion.Rollback()
			if errRollback != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo rollback package BUSCA PROD POR DESCRIPCION",
					Error:   errRollback,
				})
			}

			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rowPKG.Close()

		rows, err := WrapRows(ctx, db, rowPKG)
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo wrap rows",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		defer rows.Close()
		for rows.Next() {
			tipoBodega := ""
			codigoBodega := ""
			valores := models.Medinsu{}

			err := rows.Scan(
				&valores.HDGCodigo,
				&valores.ESACodigo,
				&valores.CMECodigo,
				&valores.UMein,
				&valores.UCodigo,
				&valores.UDescripcion,
				&valores.CodigoCum,
				&valores.RegistroInvima,
				&valores.UTiporegistro,
				&valores.UTipomedicamento,
				&valores.UValorcosto,
				&valores.UMargen,
				&valores.UValorventa,
				&valores.UUnidadcompra,
				&valores.UUnidaddespacho,
				&valores.UIncobfonasa,
				&valores.UTipoincob,
				&valores.UEstado,
				&valores.UClasificacion,
				&valores.URecetaretenida,
				&valores.USolocompra,
				&valores.UPreparados,
				&valores.UFamilia,
				&valores.USubfamilia,
				&valores.UGrupo,
				&valores.USubGrupo,
				&valores.UCodigoPact,
				&valores.UCodigoPres,
				&valores.UCodigoFFar,
				&valores.Controlado,
				&valores.Campo,
				&valores.PoPrincipioActivo,
				&valores.PoPresentacion,
				&valores.PoFormaFarma,
				&valores.PoDesUnidaddespacho,
				&valores.DescTipoRegistro,
				&valores.FechaInicioVigencia,
				&valores.FechaFinVigencia,
				&valores.Saldo,
				&tipoBodega,
				&codigoBodega,
			)

			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo scan busca producto por descripcion",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			if valores.FechaFinVigencia != "" {
				dateString := "2006/01/02"
				vigencia, err := time.Parse(dateString, valores.FechaFinVigencia)
				if err != nil {
					logger.Warn(logs.InformacionLog{
						Mensaje: "Error al parsear la fecha de vigencia de producto",
						Error:   err,
						Contexto: map[string]interface{}{
							"meinId":           valores.UMein,
							"formato":          start.Format("2006/01/02"),
							"fechaActual":      time.Now(),
							"fechaFinVigencia": valores.FechaFinVigencia,
							"vigencia":         vigencia,
						},
					})
				} else {
					if start.Before(vigencia) {
						valores.Mensaje = "Articulo Vigente en Sistema."
						valores.Vigencia = start.Before(vigencia)
					} else {
						valores.Mensaje = "Articulo No Vigente en Sistema."
						valores.Vigencia = start.Before(vigencia)
					}
				}
			} else {
				valores.Mensaje = "Articulo sin Fecha de termino de vigencia."
				valores.Vigencia = true
			}

			if tipoBodega == "G" {
				ResultWmConsSal, err := WmConsultaSaldo(
					strconv.Itoa(res.PiESACodigo),
					strconv.Itoa(valores.HDGCodigo),
					strconv.Itoa(res.IDBodega),
					valores.UCodigo,
					0,
					res.PiServidor,
				)

				if err != nil {
					logger.Error(logs.InformacionLog{
						Mensaje: "Fallo consulta de saldo WS",
						Error:   err,
					})
					http.Error(w, err.Error(), http.StatusInternalServerError)
					return
				}

				valores.Saldo, _ = strconv.Atoi(ResultWmConsSal.Cantidad)
			}

			retornoValores = append(retornoValores, valores)
		}
	} else {
		if res.IDBodega == 0 {
			query = query + " SELECT HDGCodigo, ESACodigo, CMECodigo, mein_id, trim(mein_codmei), trim(mein_descri) mein_descri, mein_codigo_cum, mein_registro_invima "
			query = query + ", mein_tiporeg, nvl(mein_tipomed,0) mein_tipomed, nvl(mein_valcos,0) mein_valcos, nvl(mein_margen,0) mein_margen "
			query = query + ", nvl(mein_valven,0) mein_valven, nvl(mein_u_comp,0) mein_u_comp, nvl(mein_u_desp,0) mein_u_desp, nvl(mein_incob_fonasa,'N'), nvl(mein_tipo_incob,' '), nvl(mein_estado,0) mein_estado, nvl(mein_clasificacion,0) mein_clasificacion "
			query = query + ", mein_receta_retenida, nvl(mein_prod_solo_compras,' '), nvl(mein_preparados,' '), nvl(mein_Familia,0) mein_Familia "
			query = query + ", nvl(mein_SubFamilia,0) mein_SubFamilia, nvl(mein_grupo,0) mein_grupo, nvl(mein_subgrupo,0) mein_subgrupo, nvl(mein_pact_id,0) mein_pact_id, nvl(mein_pres_id,0) mein_pres_id "
			query = query + ", nvl(mein_ffar_id,0) mein_ffar_id, mein_controlado, '' Campo "
			query = query + ", (select nvl(trim(pact_descri),' ') from clin_far_principio_act where pact_id = mein_pact_id) principioactivo "
			query = query + ", (select  nvl(trim(pres_descri), ' ') from clin_far_presentacion_med where pres_id = mein_pres_id)  presentacion "
			query = query + ", (select nvl(trim(ffar_descri), ' ') from clin_far_forma_farma  where ffar_id = mein_ffar_id) formafarma "
			query = query + ", decode (nvl(mein_u_desp,0) , 0, ' ',nvl((select FPAR_DESCRIPCION from clin_far_param where FPAR_TIPO = 4 and FPAR_CODIGO = mein_u_desp), ' ')) desunidaddespacho "
			query = query + ", (select FPAR_DESCRIPCION from clin_far_param where FPAR_TIPO=27 and fpar_valor= CLIN_FAR_MAMEIN.mein_tiporeg)  tipoproducto "
			query = query + ", to_char(fecha_inicio_vigencia,'YYYY/MM/DD') AS fechainiciovigencia "
			query = query + ", to_char(fecha_fin_vigencia, 'YYYY/MM/DD') AS fechafinvigencia "
			query = query + ", 0 "
			query = query + ", ' ' as tipobodega"
			query = query + ", ' ' as codigobodegaf"
			query = query + " FROM CLIN_FAR_MAMEIN WHERE hdgcodigo = " + strconv.Itoa(PiHDGCodi)
			query = query + " AND ESACODIGO = " + strconv.Itoa(PiESACodi)
			query = query + " AND CMECODIGO = " + strconv.Itoa(PiCMECodi)
			if res.PiProveedor > 0 {
				query = query + " AND  mein_id in (SELECT PRMI_MEIN_ID from clin_prove_mamein where PRMI_PROV_ID = " + strconv.Itoa(res.PiProveedor) + ")"
			}
			if res.PiTipoDoc > 0 && res.PiTipoDoc <= 3 {
				query = query + " AND  mein_id in (select odet_mein_id from clin_far_oc_guias "
				query = query + "	left join clin_far_oc_detmov on clin_far_oc_detmov.odmo_guia_id = clin_far_oc_guias.guia_id "
				query = query + "	left join clin_far_oc_det on clin_far_oc_det.odet_id = clin_far_oc_detmov.odmo_odet_id "
				query = query + "	where guia_tipo_doc = " + strconv.Itoa(res.PiTipoDoc) + ") "
			}

			if res.PiTipoDoc > 0 && res.PiTipoDoc >= 4 {
				query = query + " AND  mein_id in (select distinct odet_mein_id from clin_far_oc_detmov_dev "
				query = query + "	left join clin_far_oc_detmov on odmd_odmo_id = odmo_id "
				query = query + "	left join clin_far_oc_det on clin_far_oc_det.odet_id = clin_far_oc_detmov.odmo_odet_id "
				query = query + "	where odmd_tipo_doc = " + strconv.Itoa(res.PiTipoDoc) + ") "
			}

			if res.PiNumdoc > 0 {
				query = query + " AND  mein_id in (select odet_mein_id from clin_far_oc_guias "
				query = query + "	left join clin_far_oc_detmov on clin_far_oc_detmov.odmo_guia_id = clin_far_oc_guias.guia_id "
				query = query + "	left join clin_far_oc_det on clin_far_oc_det.odet_id = clin_far_oc_detmov.odmo_odet_id "
				query = query + "	where guia_numero_doc = " + strconv.Itoa(res.PiNumdoc) + ") "
			}

			if res.PiPantalla == "devolucion" { //para la pantalla de devoluciones solo busuqe medicamentos en las guias
				query = query + " AND  mein_id in (select odet_mein_id from clin_far_oc_guias "
				query = query + "	left join clin_far_oc_detmov on clin_far_oc_detmov.odmo_guia_id = clin_far_oc_guias.guia_id "
				query = query + "	left join clin_far_oc_det on clin_far_oc_det.odet_id = clin_far_oc_detmov.odmo_odet_id) "
			}

			if res.PiPantalla == "nota" { //para la pantalla de devoluciones solo busuqe medicamentos en las guias
				query = query + " AND  mein_id in (select distinct odet_mein_id from clin_far_oc_detmov_dev "
				query = query + "	left join clin_far_oc_detmov on odmd_odmo_id = odmo_id "
				query = query + "	left join clin_far_oc_det on clin_far_oc_det.odet_id = clin_far_oc_detmov.odmo_odet_id) "
			}

			if PiTipProd == "MIM" { // Todos los medicamnetos e insumos medicos
				query = query + " and ( mein_tiporeg = 'I' or   mein_tiporeg = 'M' )"
			}
			if PiTipProd != "" && PiTipProd != "MIM" {
				query = query + " and mein_tiporeg = '" + PiTipProd + "' "
			}
			if PiDesMed != "" {
				query = query + " and UPPER(mein_descri) like '%" + strings.ToUpper(PiDesMed) + "%' "
			}
			if res.PiPrincActivo > 0 {
				query = query + " and  mein_pact_id = " + strconv.Itoa(res.PiPrincActivo)
			}
			if res.PiPresentacion > 0 {
				query = query + " and mein_pres_id = " + strconv.Itoa(res.PiPresentacion)
			}
			if res.PiFormaFarma > 0 {
				query = query + " and mein_ffar_id = " + strconv.Itoa(res.PiFormaFarma)
			}
			if res.PiCodigo != "" {
				query = query + " and mein_codmei like '%" + res.PiCodigo + "%' "
			}
			if res.CLINUMIDENTIFICACION != "" {
				query = query + " AND MEIN_CODMEI IN (SELECT SODE_MEIN_CODMEI FROM CLIN_FAR_SOLICITUDES_DET WHERE SODE_SOLI_ID IN (SELECT SOLI_ID FROM CLIN_FAR_SOLICITUDES WHERE SOLI_NUMDOC_PAC = TRIM('" + res.CLINUMIDENTIFICACION + "'))) "
			}
			if res.CUM != 0 {
				query = query + " AND mein_codigo_cum = " + strconv.Itoa(res.CUM)
			}
			// if BodegaProductos != "" {
			// query = query + " AND NOT MEIN_ID IN (" + BodegaProductos +")"
			// }
			query = query + "  order by mein_descri "
		}

		if res.IDBodega > 0 {
			// query = " select cursor( "
			query = query + " SELECT HDGCodigo, ESACodigo, CMECodigo, mein_id, trim(mein_codmei), trim(mein_descri) mein_descri,mein_codigo_cum, mein_registro_invima "
			query = query + ", mein_tiporeg, nvl(mein_tipomed,0) mein_tipomed, nvl(mein_valcos,0) mein_valcos, nvl(mein_margen,0) mein_margen "
			query = query + ", nvl(mein_valven,0) mein_valven, nvl(mein_u_comp,0) mein_u_comp, nvl(mein_u_desp,0) mein_u_desp, nvl(mein_incob_fonasa,'N'), nvl(mein_tipo_incob,' '), nvl(mein_estado,0) mein_estado, nvl(mein_clasificacion,0) mein_clasificacion "
			query = query + ", mein_receta_retenida, nvl(mein_prod_solo_compras,' '), nvl(mein_preparados,' '), nvl(mein_Familia,0) mein_Familia "
			query = query + ", nvl(mein_SubFamilia,0) mein_SubFamilia, nvl(mein_grupo,0) mein_grupo, nvl(mein_subgrupo,0) mein_subgrupo, nvl(mein_pact_id,0) mein_pact_id, nvl(mein_pres_id,0) mein_pres_id "
			query = query + ", nvl(mein_ffar_id,0) mein_ffar_id, mein_controlado, '' Campo "
			query = query + ", (select nvl(trim(pact_descri),' ') from clin_far_principio_act where pact_id = mein_pact_id) principioactivo "
			query = query + ", (select  nvl(trim(pres_descri), ' ') from clin_far_presentacion_med where pres_id = mein_pres_id)  presentacion "
			query = query + ", (select nvl(trim(ffar_descri), ' ') from clin_far_forma_farma  where ffar_id = mein_ffar_id) formafarma "
			query = query + ", decode (nvl(mein_u_desp,0) , 0, ' ',nvl((select FPAR_DESCRIPCION from clin_far_param where FPAR_TIPO = 4 and FPAR_CODIGO = mein_u_desp), ' ')) desunidaddespacho "
			query = query + ", (select FPAR_DESCRIPCION from clin_far_param where FPAR_TIPO=27 and fpar_valor= CLIN_FAR_MAMEIN.mein_tiporeg)  tipoproducto "
			query = query + ", to_char(fecha_inicio_vigencia,'YYYY/MM/DD') AS fechainiciovigencia "
			query = query + ", to_char(fecha_fin_vigencia, 'YYYY/MM/DD') AS fechafinvigencia "
			query = query + ", nvl(FBOI_STOCK_ACTUAL, 0) as Saldo "
			query = query + ", nvl((select FBOD_TIPO_BODEGA from CLIN_FAR_BODEGAS where fbod_codigo = FBOI_FBOD_CODIGO), ' ') as tipobodega"
			query = query + ", nvl((select FBO_CODIGOBODEGA from CLIN_FAR_BODEGAS where fbod_codigo = FBOI_FBOD_CODIGO), ' ') as codigobodegaf"
			query = query + " FROM CLIN_FAR_MAMEIN, CLIN_FAR_BODEGAS_INV WHERE hdgcodigo = " + strconv.Itoa(PiHDGCodi)
			query = query + " AND ESACODIGO = " + strconv.Itoa(PiESACodi)
			query = query + " AND CMECODIGO = " + strconv.Itoa(PiCMECodi)
			query = query + " and FBOI_FBOD_CODIGO = " + strconv.Itoa(res.IDBodega)
			query = query + " and FBOI_MEIN_ID = mein_id "
			// query = query + " and MEIN_ESTADO = 1 "
			// query = query + " and FECHA_FIN_VIGENCIA >= SYSDATE "
			if PiTipProd == "MIM" { // Todos los medicamnetos e insumos medicos
				query = query + " and ( mein_tiporeg = 'I' or   mein_tiporeg = 'M' )"
			}
			if PiTipProd != "" && PiTipProd != "MIM" {
				query = query + " and mein_tiporeg = '" + PiTipProd + "' "
			}
			if PiDesMed != "" {
				query = query + " and mein_descri like '%" + strings.ToUpper(PiDesMed) + "%' "
			}
			if res.PiPrincActivo > 0 {
				query = query + " and  mein_pact_id = " + strconv.Itoa(res.PiPrincActivo)
			}
			if res.PiPresentacion > 0 {
				query = query + " and mein_pres_id = " + strconv.Itoa(res.PiPresentacion)
			}
			if res.PiFormaFarma > 0 {
				query = query + " and mein_ffar_id = " + strconv.Itoa(res.PiFormaFarma)
			}
			if res.PiCodigo != "" {
				query = query + " and mein_codmei like '%" + res.PiCodigo + "%' "
			}

			if res.ControlMinimo != "" {
				query = query + " and FBOI_BOD_CONTROLMINIMO = '" + res.ControlMinimo + "' "
			}
			if res.Controlado != "" {
				query = query + " and MEIN_CONTROLADO = '" + res.Controlado + "' "
			}
			if res.Consignacion != "" {
				query = query + " and MEIN_CONSIGNACION = '" + res.Consignacion + "' "
			}
			if res.CLINUMIDENTIFICACION != "" {
				query = query + " AND MEIN_CODMEI IN (SELECT SODE_MEIN_CODMEI FROM CLIN_FAR_SOLICITUDES_DET WHERE SODE_SOLI_ID IN (SELECT SOLI_ID FROM CLIN_FAR_SOLICITUDES WHERE SOLI_NUMDOC_PAC = TRIM('" + res.CLINUMIDENTIFICACION + "'))) "
			}
			if BodegaProductos != "" {
				query = query + " AND NOT MEIN_ID IN (" + BodegaProductos + ")"
			}
			if res.CUM != 0 {
				query = query + " AND mein_codigo_cum = " + strconv.Itoa(res.CUM)
			}
			query = query + "  order by mein_descri "
		}

		rows, err := db.QueryContext(ctx, query)

		logger.Trace(logs.InformacionLog{
			Query:   query,
			Mensaje: "Query busca producto por descripcion",
		})

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   query,
				Mensaje: "Se cayo query busca producto por descripcion",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		for rows.Next() {
			tipoBodega := ""
			codigoBodega := ""
			valores := models.Medinsu{}

			err := rows.Scan(
				&valores.HDGCodigo,
				&valores.ESACodigo,
				&valores.CMECodigo,
				&valores.UMein,
				&valores.UCodigo,
				&valores.UDescripcion,
				&valores.CodigoCum,
				&valores.RegistroInvima,
				&valores.UTiporegistro,
				&valores.UTipomedicamento,
				&valores.UValorcosto,
				&valores.UMargen,
				&valores.UValorventa,
				&valores.UUnidadcompra,
				&valores.UUnidaddespacho,
				&valores.UIncobfonasa,
				&valores.UTipoincob,
				&valores.UEstado,
				&valores.UClasificacion,
				&valores.URecetaretenida,
				&valores.USolocompra,
				&valores.UPreparados,
				&valores.UFamilia,
				&valores.USubfamilia,
				&valores.UGrupo,
				&valores.USubGrupo,
				&valores.UCodigoPact,
				&valores.UCodigoPres,
				&valores.UCodigoFFar,
				&valores.Controlado,
				&valores.Campo,
				&valores.PoPrincipioActivo,
				&valores.PoPresentacion,
				&valores.PoFormaFarma,
				&valores.PoDesUnidaddespacho,
				&valores.DescTipoRegistro,
				&valores.FechaInicioVigencia,
				&valores.FechaFinVigencia,
				&valores.Saldo,
				&tipoBodega,
				&codigoBodega,
			)

			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo scan busca producto por descripcion",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			if valores.FechaFinVigencia != "" {
				dateString := "2006/01/02"
				vigencia, err := time.Parse(dateString, valores.FechaFinVigencia)
				if err != nil {
					logger.Warn(logs.InformacionLog{
						Mensaje: "Error al parsear la fecha de vigencia de producto",
						Error:   err,
						Contexto: map[string]interface{}{
							"meinId":           valores.UMein,
							"formato":          start.Format("2006/01/02"),
							"fechaActual":      time.Now(),
							"fechaFinVigencia": valores.FechaFinVigencia,
							"vigencia":         vigencia,
						},
					})
				} else {
					if start.Before(vigencia) {
						valores.Mensaje = "Articulo Vigente en Sistema."
						valores.Vigencia = start.Before(vigencia)
					} else {
						valores.Mensaje = "Articulo No Vigente en Sistema."
						valores.Vigencia = start.Before(vigencia)
					}
				}
			} else {
				valores.Mensaje = "Articulo sin Fecha de termino de vigencia."
				valores.Vigencia = true
			}

			if tipoBodega == "G" {
				ResultWmConsSal, err := WmConsultaSaldo(
					strconv.Itoa(res.PiESACodigo),
					strconv.Itoa(valores.HDGCodigo),
					strconv.Itoa(res.IDBodega),
					valores.UCodigo,
					0,
					res.PiServidor,
				)

				if err != nil {
					logger.Error(logs.InformacionLog{
						Mensaje: "Fallo consulta de saldo WS",
						Error:   err,
					})
					http.Error(w, err.Error(), http.StatusInternalServerError)
					return
				}

				valores.Saldo, _ = strconv.Atoi(ResultWmConsSal.Cantidad)
			}

			retornoValores = append(retornoValores, valores)
		}
	}

	json.NewEncoder(w).Encode(retornoValores)
	models.EnableCors(&w)
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
