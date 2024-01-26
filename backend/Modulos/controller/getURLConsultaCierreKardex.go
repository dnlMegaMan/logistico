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

// GetURLConsultaCierreKardex is...
func GetURLConsultaCierreKardex(w http.ResponseWriter, r *http.Request) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	var retornovalores []models.URLReport2
	var valores [10]models.URLReport2
	var indice int

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
	var msg models.ParamConsultaCierreKardex
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

	res := models.ParamConsultaCierreKardex{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.PiUsuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	var qry string
	var mensaje string
	mensaje = "OK"

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

	qry = " BEGIN"
	qry = qry + " PKG_RPT_CONSULTACIERREKARDEX.PRO_RPT_CONSULTACIERREKARDEX("
	qry = qry + " " + strconv.FormatInt(intIDReport, 10)
	qry = qry + " ," + strconv.Itoa(res.PiHdgCodigo)
	qry = qry + " ," + strconv.Itoa(res.PiEsaCodigo)
	qry = qry + " ," + strconv.Itoa(res.PiCmeCodigo)
	qry = qry + " , '" + res.PiUsuario + "'"
	qry = qry + " ," + strconv.Itoa(res.PiCKarID)
	qry = qry + " ," + strconv.Itoa(res.PiCodBodega)
	qry = qry + " ," + strconv.Itoa(res.PiMeInID)
	qry = qry + " );"
	qry = qry + " END;"

	ctx := context.Background()
	resinsmovim, err := db.QueryContext(ctx, qry)

	logger.Trace(logs.InformacionLog{
		Query:   qry,
		Mensaje: "Query package reporte consulta cierre kardex",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   qry,
			Mensaje: "Se cayo query package reporte consulta cierre kardex",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer resinsmovim.Close()
	//defer db.Close()

	// Genera la URL
	var sReporte string
	var sTipo string
	var sIDReport string
	var sPrompt string
	var strURL string

	sReporte = "consultacierrekardex.rpt"

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

	valores[indice].UURL = strURL
	valores[indice].Mensaje = mensaje

	indice = indice + 1
	retornovalores = valores[0:indice]

	json.NewEncoder(w).Encode(retornovalores)
	models.EnableCors(&w)
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
