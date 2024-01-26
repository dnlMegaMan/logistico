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

// BuscarNotaFiltro is...
func BuscarNotaFiltro(w http.ResponseWriter, r *http.Request) {
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
	var msg models.BuscarNotaFiltroEntrada
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

	res := models.BuscarNotaFiltroEntrada{}
	json.Unmarshal([]byte(output), &res)

	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	Servidor := res.Servidor

	db, _ := database.GetConnection(Servidor)

	//query base
	var query string
	query = " select DISTINCT ODMD_NOTA_CREDITO, "
	query = query + "  TO_CHAR(first_value (ODMD_FECHA)    OVER (PARTITION BY ODMD_NOTA_CREDITO ORDER BY ODMD_FECHA),'dd/mm/yyyy') as ODMD_FECHA, "
	query = query + " first_value (ODMD_RESPONSABLE) OVER (PARTITION BY ODMD_NOTA_CREDITO ORDER BY ODMD_RESPONSABLE) ODMD_RESPONSABLE, "
	query = query + " first_value (ODMD_TIPO_DOC)    OVER (PARTITION BY ODMD_NOTA_CREDITO ORDER BY ODMD_TIPO_DOC) ODMD_TIPO_DOC, "
	query = query + " first_value (GUIA_PROV_ID)    OVER (PARTITION BY ODMD_NOTA_CREDITO ORDER BY GUIA_PROV_ID) GUIA_PROV_ID, "
	query = query + " first_value (ODMO_GUIA_ID)    OVER (PARTITION BY ODMD_NOTA_CREDITO ORDER BY ODMO_GUIA_ID) ODMO_GUIA_ID, "
	if res.MeinId > 0 {
		query = query + "first_value (ODMD_CANTIDAD) OVER (PARTITION BY ODMD_NOTA_CREDITO ORDER BY ODMD_CANTIDAD) ODMD_CANTIDAD"
	} else {
		query = query + "0 as ODMD_CANTIDAD"
	}
	query = query + " from clin_far_oc_detmov_dev cfodmd"
	query = query + " LEFT JOIN clin_far_oc_detmov cfodetm ON cfodetm.odmo_id = cfodmd.odmd_odmo_id "
	query = query + " and cfodetm.hdgcodigo = cfodmd.hdgcodigo "
	query = query + " and cfodetm.esacodigo = cfodmd.esacodigo "
	query = query + " and cfodetm.cmecodigo = cfodmd.cmecodigo "
	query = query + " left join clin_far_oc_guias cfog ON cfog.guia_id = cfodetm.odmo_guia_id "
	query = query + " and cfog.hdgcodigo = cfodetm.hdgcodigo "
	query = query + " and cfog.esacodigo = cfodetm.esacodigo "
	query = query + " and cfog.cmecodigo = cfodetm.cmecodigo "
	query = query + " WHERE 1 = 1 "

	query = query + " and cfodmd.hdgcodigo=" + strconv.Itoa(res.HDGCODIGO)
	query = query + " and cfodmd.esacodigo=" + strconv.Itoa(res.ESACODIGO)
	query = query + " and cfodmd.cmecodigo=" + strconv.Itoa(res.CMECODIGO)

	//tipo doc
	if res.TipoDoc > 0 {
		query = query + " and odmd_tipo_doc = " + strconv.Itoa(res.TipoDoc) + " "
	}
	//numdoc
	if res.NumDoc > 0 {
		query = query + " and ODMD_NOTA_CREDITO = " + strconv.Itoa(res.NumDoc) + " "
	}
	//proveedor
	if res.ProvId > 0 {
		query = query + " and guia_prov_id = " + strconv.Itoa(res.ProvId)
	}
	//fechas
	if res.Desde != "" && res.Hasta != "" {
		query = query + " and odmd_fecha  BETWEEN TO_DATE('" + res.Desde + "','DD-MM-YYYY') and TO_DATE('" + res.Hasta + "' ,'DD-MM-YYYY') "
	} else if res.Desde != "" {
		query = query + " and odmd_fecha >= TO_DATE('" + res.Desde + "','DD-MM-YYYY') "
	} else if res.Hasta != "" {
		query = query + " and odmd_fecha <= TO_DATE('" + res.Hasta + "' ,'DD-MM-YYYY') "
	}
	//articulo
	if res.MeinId > 0 {
		query = query + " AND  odmd_id in (select odmd_id from clin_far_oc_detmov_dev "
		query = query + "	left join clin_faR_oc_detmov on odmo_id = odmd_odmo_id  "
		query = query + "	left join clin_far_oc_det on clin_far_oc_det.odet_id = clin_far_oc_detmov.odmo_odet_id "
		query = query + "	where odet_mein_id = " + strconv.Itoa(res.MeinId) + ") "
	}
	ctx := context.Background()

	//declaracion de variables

	rowsa, erra := db.QueryContext(ctx, query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query buscar nota filtro",
	})

	retornoValores := []models.BuscarNotaSalida{}
	if erra != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query buscar nota filtro",
			Error:   erra,
		})

		valores := models.BuscarNotaSalida{Mensaje: "Error : " + erra.Error()}
		retornoValores = append(retornoValores, valores)
	} else {
		defer rowsa.Close()
		for rowsa.Next() {
			valores := models.BuscarNotaSalida{}

			erra := rowsa.Scan(
				&valores.Nota,
				&valores.OdmdFecha,
				&valores.OdmdResponsable,
				&valores.OdmdTipoDoc,
				&valores.ProvId,
				&valores.GuiaId,
				&valores.OdmdCantidad,
			)

			if erra != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo scan buscar nota filtro",
					Error:   err,
				})

				valores := models.BuscarNotaSalida{Mensaje: "Error : " + erra.Error()}
				retornoValores = append(retornoValores, valores)
				json.NewEncoder(w).Encode(retornoValores)
				return
			} else {
				// QUERY GUIAS
				query = ""
				query = query + " select guia_id,guia_monto_total,TO_CHAR(guia_fecha_emision,'dd/mm/yyyy') as guia_fecha_emision,prov_descripcion, prov_giro, prov_direccion, nvl((select descripcion from conv_zonas where numero = prov_comuna and zona_type = 'COMU'), ' ') as prov_comuna,  "
				query = query + "  nvl((select descripcion from conv_zonas where numero = prov_ciudad and zona_type = 'CIUD'), ' ') as prov_ciudad, prov_telefono, prov_telefono2, prov_numfax, "
				query = query + " guia_numero_doc, (select glstipodoc from clin_far_param_oc_tipodoc where codtipodoc = guia_tipo_doc) as tipo_doc, guia_tipo_doc as tipo, prov_numrut ||'-'|| prov_digrut as rutprov"
				query = query + " ,0 as odmo_cantidad "
				query = query + " from clin_far_oc_guias cfog "
				query = query + " left join clin_proveedores cp on cp.prov_id = cfog.guia_prov_id "
				query = query + " and cp.hdgcodigo = cfog.hdgcodigo "
				query = query + " and cp.esacodigo = cfog.esacodigo "
				query = query + " and cp.cmecodigo = cfog.cmecodigo "
				query = query + " where guia_id = " + strconv.Itoa(valores.GuiaId)
				query = query + " and cfog.hdgcodigo=" + strconv.Itoa(res.HDGCODIGO)
				query = query + " and cfog.esacodigo=" + strconv.Itoa(res.ESACODIGO)
				query = query + " and cfog.cmecodigo=" + strconv.Itoa(res.CMECODIGO) + " "

				rows, err := db.QueryContext(ctx, query)

				logger.Trace(logs.InformacionLog{
					Query:   query,
					Mensaje: "Query buscar guias oc",
				})

				if err != nil {
					logger.Error(logs.InformacionLog{
						Query:   query,
						Mensaje: "Se cayo query buscar guias oc",
						Error:   err,
					})
					valores.Mensaje = "Error : " + err.Error()
					retornoValores = append(retornoValores, valores)
					json.NewEncoder(w).Encode(retornoValores)
					return
				} else {
					defer rows.Close()
					for rows.Next() {
						valoresguia := models.BuscarGuiaSalida{}

						// Solo para satisfacer el scan
						var strVal23 int

						err := rows.Scan(
							&valoresguia.GuiaId,
							&valoresguia.MontoTotal,
							&valoresguia.FechaEmision,
							&valoresguia.ProvDescripcion,
							&valoresguia.ProvGiro,
							&valoresguia.ProvDireccion,
							&valoresguia.ProvComuna,
							&valoresguia.ProvCiudad,
							&valoresguia.ProvTelefono,
							&valoresguia.ProvTelefono2,
							&valoresguia.ProvNumfax,
							&valoresguia.Numdoc,
							&valoresguia.Tipodoc,
							&valoresguia.Tipo,
							&valoresguia.RutProv,
							&strVal23,
						)

						if err != nil {
							logger.Error(logs.InformacionLog{
								Mensaje: "Se cayo scan buscar guias oc",
								Error:   err,
							})

							valores.Mensaje = "Error : " + err.Error()
							retornoValores = append(retornoValores, valores)
							json.NewEncoder(w).Encode(retornoValores)
							return
						} else {
							// QUERY NOTAS
							query = ""
							query = query + " select mein_codmei, mein_descri, odmd_cantidad  "
							query = query + "    ,(select lote from clin_far_oc_lotes where clin_far_oc_lotes.odmo_id = cfodm.odmo_id) as lote, odmd_tipo_doc, odmo_cantidad, glsmotivo_dev "
							query = query + " from clin_far_oc_detmov_dev cfodmd"
							query = query + " LEFT JOIN  clin_far_oc_detmov cfodm ON cfodm.odmo_id = cfodmd.odmd_odmo_id "
							query = query + " and cfodm.hdgcodigo = cfodmd.hdgcodigo "
							query = query + " and cfodm.esacodigo = cfodmd.esacodigo "
							query = query + " and cfodm.cmecodigo = cfodmd.cmecodigo "
							query = query + " left join clin_far_oc_det cfod on cfod.odet_id = cfodm.odmo_odet_id "
							query = query + " and cfod.hdgcodigo = cfodm.hdgcodigo "
							query = query + " and cfod.esacodigo = cfodm.esacodigo "
							query = query + " and cfod.cmecodigo = cfodm.cmecodigo "
							query = query + " left join clin_far_mamein cfm on cfm.mein_id = cfod.odet_mein_id "
							query = query + " and cfm.hdgcodigo = cfod.hdgcodigo "
							query = query + " and cfm.esacodigo = cfod.esacodigo "
							query = query + " and cfm.cmecodigo = cfod.cmecodigo "
							query = query + " left join clin_far_param_oc_motivo_dev on codmotivo_dev = odmd_motivo "
							query = query + " where odmd_nota_credito = " + strconv.Itoa(valores.Nota)
							query = query + " and cfodmd.hdgcodigo=" + strconv.Itoa(res.HDGCODIGO)
							query = query + " and cfodmd.esacodigo=" + strconv.Itoa(res.ESACODIGO)
							query = query + " and cfodmd.cmecodigo=" + strconv.Itoa(res.CMECODIGO) + " "

							logger.Trace(logs.InformacionLog{
								Query:   query,
								Mensaje: "Query detalles mov dev",
							})

							rowss, errr := db.QueryContext(ctx, query)
							if errr != nil {
								logger.Error(logs.InformacionLog{
									Query:   query,
									Mensaje: "Se cayo query detalles mov dev",
									Error:   errr,
								})

								valores.Mensaje = "Error : " + errr.Error()
								retornoValores = append(retornoValores, valores)
								json.NewEncoder(w).Encode(retornoValores)
								return
							} else {
								defer rowss.Close()

								for rowss.Next() {
									valoresdet := models.DetalleMovimientoDevo{}

									errr := rowss.Scan(
										&valoresdet.MeinCodmei,
										&valoresdet.MeinDescri,
										&valoresdet.OdmdCantidad,
										&valoresdet.Lote,
										&valoresdet.TipoDoc,
										&valoresdet.OdmoCantidad,
										&valoresdet.MotivoDevDesc,
									)

									if errr != nil {
										logger.Error(logs.InformacionLog{
											Mensaje: "Se cayo scan detalles mov dev",
											Error:   errr,
										})
										valores.Mensaje = "Error : " + errr.Error()
										retornoValores = append(retornoValores, valores)
										json.NewEncoder(w).Encode(retornoValores)
										return
									} else {
										valores.NotaDetalle = append(valores.NotaDetalle, valoresdet)
									}
								}
							}
						}
						valores.GuiaDetalle = valoresguia
					}
				}
			}

			if len(retornoValores) == 0 {
				valores := models.BuscarNotaSalida{Mensaje: "Sin Datos"}
				retornoValores = append(retornoValores, valores)
			} else {
				valores := models.BuscarNotaSalida{Mensaje: "Exito"}
				retornoValores = append(retornoValores, valores)
			}
		}
	}

	json.NewEncoder(w).Encode(retornoValores)
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
