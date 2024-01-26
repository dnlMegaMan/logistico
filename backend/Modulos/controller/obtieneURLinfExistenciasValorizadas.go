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

// ObtieneURLinfExistenciasValorizadas is...
func ObtieneURLinfExistenciasValorizadas(w http.ResponseWriter, r *http.Request) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	var valores models.URLReport

	models.EnableCors(&w)

	w.Header().Set("Content-Type", "application/json")

	var requestMessage models.ParamInfExistenciasValorizadas

	err := comun.ParseRequestBody(r, &requestMessage)
	if err != nil {
		comun.HandleError(w, "Error validating request", err, http.StatusInternalServerError, logger)
		return
	}

	// Marshal and log request
	comun.LogAndMarshalRequest(w, &requestMessage, logger)

	// Get database connection
	con, _ := database.GetConnection(requestMessage.Servidor)

	ctx := context.Background()
	tx, err := con.Begin()
	if err != nil {
		comun.HandleTransactionError(err, w, logger)
		return
	}

	defer comun.HandleTransactionCleanup(tx, logger, &err)

	// Obtiene el IdReport
	intIDReport, err := ObtieneidReport(requestMessage.Servidor)
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "Fallo obtencion del ID del reporte",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	requestMessage.ReporteID = intIDReport

	PKG := "PKG_RPT_EXISTENCIAS_VALORIZADA"
	QUERY := "BEGIN PKG_RPT_EXISTENCIAS_VALORIZADA.PRO_RPT_EXISTENCIAS_VALORIZADA(:1,:2,:3); END;"
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

	var sReporte string

	switch requestMessage.Language {

	case "en-US":
		sReporte = "rpt_existencias_valorizadas_en.rpt"
	case "pt-BR":
		sReporte = "rpt_existencias_valorizadas_br.rpt"
	default:
		sReporte = "rpt_existencias_valorizadas_cl.rpt"
	}

	if requestMessage.HdgCodigo == 2 {
		sReporte = "rpt_existencias_valorizadas_co.rpt"
	}

	sTipo := requestMessage.TipoReport
	sIDReport := strconv.FormatInt(intIDReport, 10)

	sPrompt := "&prompt0=" + sIDReport
	sPrompt = sPrompt + "&prompt1=" + strconv.Itoa(requestMessage.EsaCodigo)

	strURL, err := ObtieneURL(sReporte, sTipo, sPrompt, sIDReport, requestMessage.Servidor)
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "Fallo obtencion de la URL del reporte",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	valores.UUrl = strURL

	json.NewEncoder(w).Encode(valores)
	models.EnableCors(&w)
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
