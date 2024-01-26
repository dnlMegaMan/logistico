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

// ObtieneURLinfConsolidadoDevoluciones is...
func ObtieneURLinfConsolidadoDevoluciones(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ParamInfConsolidadoDevoluciones
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

	res := models.ParamInfConsolidadoDevoluciones{}
	json.Unmarshal([]byte(output), &res)

	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	var qry string
	mensaje := "OK"

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
	qry = qry + " PKG_RPT_TENDENCIAS_DEV.PRO_RPT_TENDENCIAS_DEV("
	qry = qry + "  '" + res.PiTiporeg + "'"
	qry = qry + " ," + strconv.Itoa(res.PiTipomed)
	qry = qry + " , '" + res.PiFechaini + "'"
	qry = qry + " , '" + res.PiFechafin + "'"
	qry = qry + " ," + strconv.FormatInt(intIDReport, 10)
	qry = qry + " ," + strconv.Itoa(res.PiHdgCodigo)
	qry = qry + " ," + strconv.Itoa(res.PiEsaCodigo)
	qry = qry + " ," + strconv.Itoa(res.PiCmeCodigo)
	qry = qry + " , '" + res.PiUsuario + "'"
	qry = qry + " );"
	qry = qry + " END;"

	ctx := context.Background()
	resinsmovim, err := db.QueryContext(ctx, qry)

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   qry,
			Mensaje: "Se cayo query package informe consolidado devoluciones",
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

	sReporte = "rpt_tendencias_devol.rpt"

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
