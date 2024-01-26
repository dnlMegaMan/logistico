package controller

import (
	"context"
	"encoding/json"
	"net/http"
	"strconv"

	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"

	"sonda.com/logistico/Modulos/comun"
	"sonda.com/logistico/Modulos/models"
)

// ObtieneURLinfListaConteoInventario is...
func ObtieneURLinfListaConteoInventario(w http.ResponseWriter, r *http.Request) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	var retornovalores []models.URLReport2
	var valores [10]models.URLReport2
	var indice int

	models.EnableCors(&w)
	w.Header().Set("Content-Type", "application/json")

	var requestMessage models.ParamInfListaConteoInventario

	err := comun.ParseRequestBody(r, &requestMessage)
	if err != nil {
		comun.HandleError(w, "Error validating request", err, http.StatusInternalServerError, logger)
		return
	}

	// Marshal and log request
	comun.LogAndMarshalRequest(w, &requestMessage, logger)

	// Get database connection
	con, _ := database.GetConnection(requestMessage.PiServidor)

	ctx := context.Background()
	tx, err := con.Begin()
	if err != nil {
		comun.HandleTransactionError(err, w, logger)
		return
	}

	defer comun.HandleTransactionCleanup(tx, logger, &err)

	intIDReport, err := ObtieneidReport(requestMessage.PiServidor)
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "Fallo obtencion del ID del reporte",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	requestMessage.PiIDReport = intIDReport

	PKG := "PKG_RPT_LISTADO_ALFA_PRODUCTOS"
	QUERY := "BEGIN PKG_RPT_LISTADO_ALFA_PRODUCTOS.PRO_RPT_LISTADO_ALFA_PRODUCTOS(:1,:2,:3); END;"
	_, err = comun.PrepareQueryPCK(ctx, con, w, QUERY, PKG, requestMessage, logger)
	if err != nil {
		comun.HandleTransactionError(err, w, logger)
		return
	}

	err = tx.Commit()
	if err != nil {
		comun.HandleTransactionCommitError(err, logger, tx)
		return
	}

	// Obtiene el mensaje de salida del paquete
	// Genera la URL
	var sReporte string
	var sTipo string
	var sIDReport string
	var sPrompt string
	var strURL string

	switch requestMessage.PiLanguage {

	case "en-US":
		sReporte = "rpt_lista_conteo_inventario_en.rpt"
		if requestMessage.PiTipoReport == "xls" {
			sReporte = "rpt_lista_conteo_inventario_en_xls.rpt"
		}
	case "pt-BR":
		sReporte = "rpt_lista_conteo_inventario_br.rpt"
		if requestMessage.PiTipoReport == "xls" {
			sReporte = "rpt_lista_conteo_inventario_br_xls.rpt"
		}
	default:
		sReporte = "rpt_lista_conteo_inventario_cl.rpt"
		if requestMessage.PiTipoReport == "xls" {
			sReporte = "rpt_lista_conteo_inventario_cl_xls.rpt"
		}

	}

	if requestMessage.PiHdgCodigo == 2 {
		sReporte = "rpt_lista_conteo_inventario_co.rpt"
		if requestMessage.PiTipoReport == "xls" {
			sReporte = "rpt_lista_conteo_inventario_co_xls.rpt"
		}
	}

	sTipo = requestMessage.PiTipoReport
	sIDReport = strconv.FormatInt(intIDReport, 10)
	sPrompt = "&prompt0=" + sIDReport
	sPrompt = sPrompt + "&prompt1=" + strconv.Itoa(requestMessage.PiEsaCodigo)

	strURL, err = ObtieneURL(sReporte, sTipo, sPrompt, sIDReport, requestMessage.PiServidor)
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "Fallo obtencion de la URL del reporte",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	indice = 0

	valores[indice].UURL = strURL
	valores[indice].Mensaje = "OK"

	indice = indice + 1
	retornovalores = valores[0:indice]

	json.NewEncoder(w).Encode(retornovalores)
	models.EnableCors(&w)
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
