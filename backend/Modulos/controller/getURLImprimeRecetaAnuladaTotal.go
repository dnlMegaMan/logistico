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

// GetURLImprimeRecetaAnuladaTotal is...
func GetURLImprimeRecetaAnuladaTotal(w http.ResponseWriter, r *http.Request) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	models.EnableCors(&w)
	var retornovalores []models.URLReport
	var valores [10]models.URLReport
	var indice int

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
	var msg models.GetRPTImprimeRecetaAnuladaParam
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

	res := models.GetRPTImprimeRecetaAnuladaParam{}
	json.Unmarshal([]byte(output), &res)

	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	// Obtiene el IdReport
	intIDReport, err := ObtieneidReport(res.PiServidor)
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "Fallo obtencion del ID del reporte",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	db, _ := database.GetConnection(res.PiServidor)

	var qry string
	qry = " BEGIN"
	qry = qry + " PKG_RPT_RECETASANULADAS.PRO_RPT_RECETASANULADAS("
	qry = qry + " " + strconv.FormatInt(intIDReport, 10)
	qry = qry + " ," + strconv.Itoa(res.PiHdgCodigo)
	qry = qry + " ," + strconv.Itoa(res.PiEsaCodigo)
	qry = qry + " ," + strconv.Itoa(res.PiCmeCodigo)
	qry = qry + " ," + strconv.Itoa(res.PiCodAmbito)
	qry = qry + " ," + strconv.Itoa(res.PiReceID)
	qry = qry + " , '" + res.PiFechaDesde + "'"
	qry = qry + " , '" + res.PiFechaHasta + "'"
	qry = qry + " ," + strconv.Itoa(res.PiTipIdentificacionPac)
	qry = qry + " , '" + res.PiNumIdentificacionPac + "'"
	qry = qry + " , '" + res.PiNombrePac + "'"
	qry = qry + " , '" + res.PiApePaternoPac + "'"
	qry = qry + " , '" + res.PiApeMaternoPac + "'"
	qry = qry + " );"
	qry = qry + " END;"

	ctx := context.Background()
	resinsmovim, err := db.QueryContext(ctx, qry)

	logger.Trace(logs.InformacionLog{
		Query:   qry,
		Mensaje: "Query package reporte recetas anuladas",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   qry,
			Mensaje: "Se cayo query package reporte recetas anuladas",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer resinsmovim.Close()

	// Genera la URL
	var sReporte string
	var sTipo string
	var sIDReport string
	var sPrompt string
	var strURL string

	sReporte = "recetaanuladatotal.rpt"

	sTipo = res.PiTipoReport
	sIDReport = strconv.FormatInt(intIDReport, 10)

	sPrompt = "&prompt0=" + sIDReport
	sPrompt = sPrompt + "&prompt1=" + strconv.Itoa(res.PiEsaCodigo)

	strURL, err = ObtieneURL(sReporte, sTipo, sPrompt, sIDReport, res.PiServidor)
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "Fallo obtencion de la URL del reporte",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	indice = 0

	valores[indice].UUrl = strURL

	indice = indice + 1
	retornovalores = valores[0:indice]

	json.NewEncoder(w).Encode(retornovalores)
	models.EnableCors(&w)
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
