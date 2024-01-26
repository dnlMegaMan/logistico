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

	"sonda.com/logistico/Modulos/models"
)

// GetURLReportePedidoGastoServicio is...
func GetURLReportePedidoGastoServicio(w http.ResponseWriter, r *http.Request) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	var retornovalores []models.URLReport
	var valores models.URLReport

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
	var msg models.ParamReportePedidoGastoServicio
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
	// Marshal
	output, err := json.Marshal(msg)
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "No puede volver a crear JSON",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	res := models.ParamReportePedidoGastoServicio{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.Usuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	// Obtiene el IdReport
	intIDReport, err := ObtieneidReport(res.Servidor)
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "Fallo obtencion del ID del reporte",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	db, _ := database.GetConnection(res.Servidor)

	qry := " BEGIN"
	qry += " PKG_RPT_PEDIDOGASTOSERVICIO.PRO_RPT_PEDIDOGASTOSERVICIO("
	qry += " " + strconv.FormatInt(intIDReport, 10)
	qry += " ," + strconv.Itoa(res.HdgCodigo)
	qry += " ," + strconv.Itoa(res.EsaCodigo)
	qry += " ," + strconv.Itoa(res.CmeCodigo)
	qry += " , '" + res.Usuario + "'"
	qry += " , '" + res.FechaDesde + "'"
	qry += " , '" + res.FechaHasta + "'"
	qry += " );"
	qry += " END;"

	ctx := context.Background()
	resinsmovim, err := db.QueryContext(ctx, qry)

	logger.Trace(logs.InformacionLog{
		Query:   qry,
		Mensaje: "Query package reporte pedido gasto servicio PDF",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   qry,
			Mensaje: "Se cayo query package reporte pedido gasto servicio PDF",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer resinsmovim.Close()

	if res.TipoReport == "pdf" {
		// Genera la URL
		sReporte := "rptpedidogastoservicio.rpt"
		sTipo := res.TipoReport
		sIDReport := strconv.FormatInt(intIDReport, 10)

		sPrompt := "&prompt0=" + sIDReport
		sPrompt = sPrompt + "&prompt1=" + strconv.Itoa(res.EsaCodigo)

		strURL, err := ObtieneURL(sReporte, sTipo, sPrompt, sIDReport, res.Servidor)
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Fallo obtencion de la URL del reporte",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		valores.UUrl = strURL
		retornovalores = append(retornovalores, valores)

		json.NewEncoder(w).Encode(retornovalores)
		models.EnableCors(&w)
		w.Header().Set("Content-Type", "application/json")
	} else if res.TipoReport == "xls" {
		query := armarQueryParaExcel(intIDReport)

		rows, err := db.QueryContext(context.Background(), query)

		logger.Trace(logs.InformacionLog{
			Query:   query,
			Mensaje: "Query package reporte pedido gasto servicio EXCEL",
		})

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   query,
				Mensaje: "Se cayo query package reporte pedido gasto servicio EXCEL",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		datosJson := ""
		for rows.Next() {
			err := rows.Scan(&datosJson)

			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo scan reporte pedido gasto servicio EXCEL",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
		}

		defer rows.Close()

		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(datosJson))
	} else {
		logger.Warn(logs.InformacionLog{
			Mensaje:  "Tipo de reporte de gasto servicio desconocido",
			Contexto: map[string]interface{}{"tipo": res.TipoReport},
		})
		http.Error(w, err.Error(), http.StatusBadRequest)
	}

	logger.LoguearSalida()
}

func armarQueryParaExcel(reporteId int64) string {
	query := " SELECT json_arrayagg( "
	query += " JSON_OBJECT( "
	query += "     'tipo'                  IS TIPO, "
	query += "     'solicitud'             IS SOLICITUD, "
	query += "     'periodo'               IS PERIODO, "
	query += "     'dia'                   IS DIA, "
	query += "     'mes'                   IS MES, "
	query += "     'ano'                   IS ANO, "
	query += "     'fechaSolicitud'        IS FECHA_SOLICITUD, "
	query += "     'bodega'                IS BODEGA, "
	query += "     'nombreBodega'          IS NOMBRE_BODEGA, "
	query += "     'servicio'              IS SERVICIO, "
	query += "     'referenciaFin700'      IS NRO_PEDIDO_REFERENCIA_FIN700, "
	query += "     'centroCosto'           IS CENTRO_DE_COSTO, "
	query += "     'observaciones'         IS OBSERVACIONES, "
	query += "     'usuarioSolicitante'    IS USUARIO_SOLICITANTE, "
	query += "     'codigoProducto'        IS CODIGO_PRODUCTO, "
	query += "     'nombreProducto'        IS NOMBRE_PRODUCTO, "
	query += "     'cantidadSolicitada'    IS CANTIDAD_SOLICITADA, "
	query += "     'cantidadDespachada'    IS CANTIDAD_DESPACHADA, "
	query += "     'cantidadDevuelta'      IS CANTIDAD_DEVUELTA "
	query += "  ) RETURNING CLOB "
	query += " ) AS RESP_JSON "
	query += " FROM  "
	query += " ( "
	query += " SELECT "
	query += "     RPT_TIPO TIPO, "
	query += "     RPT_SOLICITUD SOLICITUD, "
	query += "     RPT_PERIODO PERIODO, "
	query += "     RPT_DIA DIA, "
	query += "     RPT_MES MES, "
	query += "     RPT_ANO ANO, "
	query += "     RPT_FECHA_SOLICITUD FECHA_SOLICITUD, "
	query += "     RPT_BODEGA BODEGA, "
	query += "     RPT_NOMBRE_BODEGA NOMBRE_BODEGA, "
	query += "     RPT_SERVICIO SERVICIO, "
	query += "     RPT_NRO_PEDIDO_REF_FIN700 NRO_PEDIDO_REFERENCIA_FIN700, "
	query += "     RPT_CENTRO_DE_COSTO CENTRO_DE_COSTO, "
	query += "     RPT_OBSERVACIONES OBSERVACIONES, "
	query += "     RPT_USUARIO_SOLICITANTE USUARIO_SOLICITANTE, "
	query += "     RPT_CODIGO_PRODUCTO CODIGO_PRODUCTO, "
	query += "     RPT_NOMBRE_PRODUCTO NOMBRE_PRODUCTO, "
	query += "     RPT_CANTIDAD_SOLICITADA CANTIDAD_SOLICITADA, "
	query += "     RPT_CANTIDAD_DESPACHADCABA CANTIDAD_DESPACHADA, "
	query += "     RPT_CANTIDAD_DEVUELTA CANTIDAD_DEVUELTA "
	query += " FROM "
	query += "     RPT_PEDIDOGASTOSERVICIODET "
	query += " WHERE "
	query += "     RPT_ID = " + strconv.FormatInt(reporteId, 10)
	query += " ) "

	return query
}
