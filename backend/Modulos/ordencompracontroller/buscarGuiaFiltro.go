package controller

import (
	"context"
	"encoding/json"
	ioutil "io"
	"net/http"
	"strconv"
	"strings"

	models "sonda.com/logistico/Modulos/ordencompramodels"
	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"
)

// BuscarGuiaFiltro is...
func BuscarGuiaFiltro(w http.ResponseWriter, r *http.Request) {
	logger := logs.ObtenerLogger(logs.OrdenCompraLogger)
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
	var msg models.BuscarGuiaFiltroEntrada
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

	res := models.BuscarGuiaFiltroEntrada{}
	json.Unmarshal([]byte(output), &res)

	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	Servidor := res.Servidor

	db, _ := database.GetConnection(Servidor)

	var query string
	query = query + " select guia_id,guia_monto_total,TO_CHAR(guia_fecha_emision,'dd/mm/yyyy') as guia_fecha_emision,prov_descripcion, prov_giro, prov_direccion, nvl((select descripcion from conv_zonas where numero = prov_comuna and zona_type = 'COMU'), ' ') as prov_comuna,  "
	query = query + "  nvl((select descripcion from conv_zonas where numero = prov_ciudad and zona_type = 'CIUD'), ' ') as prov_ciudad, prov_telefono, prov_telefono2, prov_numfax, "
	query = query + " guia_numero_doc, (select glstipodoc from clin_far_param_oc_tipodoc where codtipodoc = guia_tipo_doc) as tipo_doc, guia_tipo_doc as tipo, prov_numrut ||'-'|| prov_digrut as rutprov"
	if res.MeinId > 0 {
		query = query + " , (select odmo_cantidad from clin_far_oc_guias "
		query = query + "	left join clin_far_oc_detmov on clin_far_oc_detmov.odmo_guia_id = clin_far_oc_guias.guia_id "
		query = query + "	left join clin_far_oc_det on clin_far_oc_det.odet_id = clin_far_oc_detmov.odmo_odet_id "

		query = query + "	left join clin_far_oc_det on clin_far_oc_det.hdgcodigo = clin_far_oc_detmov.hdgcodigo "
		query = query + "	left join clin_far_oc_det on clin_far_oc_det.esacodigo = clin_far_oc_detmov.esacodigo "
		query = query + "	left join clin_far_oc_det on clin_far_oc_det.cmecodigo = clin_far_oc_detmov.cmecodigo "

		query = query + "	where odet_mein_id = " + strconv.Itoa(res.MeinId)

		query = query + " and clin_far_oc_det.hdgcodigo = " + strconv.Itoa(res.HDGCODIGO)
		query = query + " and clin_far_oc_det.esacodigo = " + strconv.Itoa(res.ESACODIGO)
		query = query + " and clin_far_oc_det.cmecodigo = " + strconv.Itoa(res.CMECODIGO)

		query = query + " and cfog.guia_id = guia_id ) as odmo_cantidad "
	} else {
		query = query + " ,0 as odmo_cantidad "
	}
	query = query + " from clin_far_oc_guias cfog "
	query = query + " left join clin_proveedores cp on cp.prov_id = cfog.guia_prov_id "
	query = query + " where 1=1 "

	if res.MeinId > 0 {
		query = query + " AND  guia_id in (select guia_id from clin_far_oc_guias "
		query = query + "	left join clin_far_oc_detmov on clin_far_oc_detmov.odmo_guia_id = clin_far_oc_guias.guia_id "
		query = query + "	left join clin_far_oc_det on clin_far_oc_det.odet_id = clin_far_oc_detmov.odmo_odet_id "

		query = query + "	left join clin_far_oc_det on clin_far_oc_det.hdgcodigo = clin_far_oc_detmov.hdgcodigo "
		query = query + "	left join clin_far_oc_det on clin_far_oc_det.esacodigo = clin_far_oc_detmov.esacodigo "
		query = query + "	left join clin_far_oc_det on clin_far_oc_det.cmecodigo = clin_far_oc_detmov.cmecodigo "

		query = query + "	where odet_mein_id = " + strconv.Itoa(res.MeinId)
		query = query + " and clin_far_oc_det.hdgcodigo = " + strconv.Itoa(res.HDGCODIGO)
		query = query + " and clin_far_oc_det.esacodigo = " + strconv.Itoa(res.ESACODIGO)
		query = query + " and clin_far_oc_det.cmecodigo = " + strconv.Itoa(res.CMECODIGO) + ") "
	}

	if res.Rut > 0 {
		query = query + " and prov_numrut = " + strconv.Itoa(res.Rut) + " "
	}

	if res.Desde != "" && res.Hasta != "" {
		query = query + " and guia_fecha_emision BETWEEN TO_DATE('" + res.Desde + "','DD-MM-YYYY') and TO_DATE('" + res.Hasta + "' ,'DD-MM-YYYY') "
	} else if res.Desde != "" {
		query = query + " and guia_fecha_emision > TO_DATE('" + res.Desde + "','DD-MM-YYYY') "
	} else if res.Hasta != "" {
		query = query + " and guia_fecha_emision < TO_DATE('" + res.Hasta + "' ,'DD-MM-YYYY') "
	}

	if res.TipoDoc > 0 {
		query = query + " and GUIA_TIPO_DOC = " + strconv.Itoa(res.TipoDoc)
	}

	if res.NumDoc > 0 {
		query = query + " and GUIA_NUMERO_DOC = " + strconv.Itoa(res.NumDoc)
	}

	if res.ProvId > 0 {
		query = query + " and guia_prov_id = " + strconv.Itoa(res.ProvId)
	}

	ctx := context.Background()
	rows, err := db.QueryContext(ctx, query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query buscar guia",
	})

	retornoValores := []models.BuscarGuiaSalida{}
	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query buscar guia",
			Error:   err,
		})

		valores := models.BuscarGuiaSalida{Mensaje: "Error : " + err.Error()}
		retornoValores = append(retornoValores, valores)
	} else {
		defer rows.Close()
		for rows.Next() {
			valores := models.BuscarGuiaSalida{}

			err := rows.Scan(
				&valores.GuiaId,
				&valores.MontoTotal,
				&valores.FechaEmision,
				&valores.ProvDescripcion,
				&valores.ProvGiro,
				&valores.ProvDireccion,
				&valores.ProvComuna,
				&valores.ProvCiudad,
				&valores.ProvTelefono,
				&valores.ProvTelefono2,
				&valores.ProvNumfax,
				&valores.Numdoc,
				&valores.Tipodoc,
				&valores.Tipo,
				&valores.RutProv,
				&valores.OdmoCantidad,
			)

			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo scan buscar guia filtro",
					Error:   err,
				})

				valores := models.BuscarGuiaSalida{Mensaje: "Error : " + err.Error()}
				retornoValores = append(retornoValores, valores)
				json.NewEncoder(w).Encode(retornoValores)
				return
			} else {
				// 	QUERY DETALLE
				query = ""
				query = query + " select odmo_id,mein_codmei, mein_descri,(odmo_monto/odmo_cantidad) as valor, odmo_cantidad, odmo_cant_devuelta "
				query = query + "    ,(select lote from clin_far_oc_lotes where clin_far_oc_lotes.odmo_id = cfodm.odmo_id) as lote "
				query = query + " from clin_far_oc_detmov cfodm "
				query = query + " left join clin_far_oc_det cfod on cfod.odet_id = cfodm.odmo_odet_id "

				query = query + " left join clin_far_oc_det cfod on cfod.hdgcodigo = cfodm.hdgcodigo "
				query = query + " left join clin_far_oc_det cfod on cfod.esacodigo = cfodm.esacodigo "
				query = query + " left join clin_far_oc_det cfod on cfod.cmecodigo = cfodm.cmecodigo "

				query = query + " left join clin_far_mamein cfm on cfm.mein_id = cfod.odet_mein_id "
				query = query + " where odmo_guia_id = " + strconv.Itoa(valores.GuiaId)

				query = query + " and cfodm.hdgcodigo = " + strconv.Itoa(res.HDGCODIGO)
				query = query + " and cfodm.esacodigo = " + strconv.Itoa(res.ESACODIGO)
				query = query + " and cfodm.cmecodigo = " + strconv.Itoa(res.CMECODIGO) + " "

				rowss, errr := db.QueryContext(ctx, query)

				logger.Trace(logs.InformacionLog{
					Query:   query,
					Mensaje: "Query buscar detalles guia",
				})

				if errr != nil {
					logger.Error(logs.InformacionLog{
						Query:   query,
						Mensaje: "Se cayo query buscar detalles guia",
						Error:   errr,
					})

					valores := models.BuscarGuiaSalida{Mensaje: "Error : " + errr.Error()}
					retornoValores = append(retornoValores, valores)
					json.NewEncoder(w).Encode(retornoValores)
					return
				} else {
					defer rowss.Close()

					for rowss.Next() {
						valoresdet := models.DetalleMovimiento{
							Adevolver: 0,
						}

						errr := rowss.Scan(
							&valoresdet.Odmoid,
							&valoresdet.MeinCodmei,
							&valoresdet.MeinDescri,
							&valoresdet.Valor,
							&valoresdet.Odmocantidad,
							&valoresdet.Odmocantdevuelta,
							&valoresdet.Lote,
						)

						if errr != nil {
							logger.Error(logs.InformacionLog{
								Mensaje: "Se cayo scan buscar detalles guia",
								Error:   errr,
							})

							valores := models.BuscarGuiaSalida{Mensaje: "Error : " + errr.Error()}
							retornoValores = append(retornoValores, valores)
							json.NewEncoder(w).Encode(retornoValores)
							return
						} else {
							valores.DetalleMov = append(valores.DetalleMov, valoresdet)
						}
					}

					valores.Mensaje = "Exito"
					retornoValores = append(retornoValores, valores)
				}
			}
		}

		if len(retornoValores) == 0 {
			valores := models.BuscarGuiaSalida{}
			valores.Mensaje = "Sin Datos"
			retornoValores = append(retornoValores, valores)
		}
	}

	json.NewEncoder(w).Encode(retornoValores)
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
