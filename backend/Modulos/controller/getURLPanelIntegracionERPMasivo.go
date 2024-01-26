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

// GetURLPanelIntegracionERPMasivo is...
func GetURLPanelIntegracionERPMasivo(w http.ResponseWriter, r *http.Request) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	var retornovalores []models.URLReport
	var valores [10]models.URLReport
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
	var msg models.ParamPanelIntegracionERPMasivo
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

	res := models.ParamPanelIntegracionERPMasivo{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.Filtro.Usuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	filtro := res.Filtro
	// Obtiene el IdReport
	intIDReport, err := ObtieneidReport(filtro.Servidor)
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "Fallo obtencion del ID del reporte",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	db, _ := database.GetConnection(filtro.Servidor)

	var qry string
	qry = " BEGIN"
	qry = qry + " PKG_RPT_PANELINTEGRACIONERP .PRO_RPT_PANELINTEGRACIONERP("
	qry = qry + " " + strconv.FormatInt(intIDReport, 10)
	qry = qry + " ," + strconv.Itoa(filtro.Hdgcodigo)
	qry = qry + " ," + strconv.Itoa(filtro.Esacodigo)
	qry = qry + " ," + strconv.Itoa(filtro.Cmecodigo)
	qry = qry + " , '" + filtro.Usuario + "'"
	qry = qry + " , '" + filtro.FechaDesde + "'"
	qry = qry + " , '" + filtro.FechaHasta + "'"
	qry = qry + " ," + strconv.Itoa(filtro.MovID)
	qry = qry + " ," + strconv.Itoa(filtro.SoliID)
	qry = qry + " , '" + filtro.Fechasol + "'"
	qry = qry + " ," + strconv.Itoa(filtro.CodBodegaSolicita)
	qry = qry + " ," + strconv.Itoa(filtro.CodBodegaSuministro)
	qry = qry + " ," + strconv.Itoa(filtro.CodEstado)
	qry = qry + " ," + strconv.Itoa(filtro.Referencia)
	qry = qry + " ," + strconv.Itoa(filtro.ReceID)
	qry = qry + " ," + strconv.Itoa(filtro.CtaNumCuenta)
	qry = qry + " , '" + filtro.NumIdentificacion + "'"
	qry = qry + " , '" + filtro.NombrePAC + "'"
	qry = qry + " ," + filtro.CodServicio + "'"
	qry = qry + " ," + strconv.Itoa(filtro.CodCentroCosto)
	qry = qry + " , '" + filtro.Descripcion + "'"
	qry = qry + " , '" + filtro.Observacion + "'"
	qry = qry + " , '" + filtro.Opcion + "'"
	qry = qry + " );"
	qry = qry + " END;"

	ctx := context.Background()
	resinsmovim, err := db.QueryContext(ctx, qry)

	logger.Trace(logs.InformacionLog{
		Query:   qry,
		Mensaje: "Query package reporte panel integracion ERP masivo",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   qry,
			Mensaje: "Se cayo query package reporte panel integracion ERP masivo",
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

	switch filtro.Opcion {
	case "BODEGAS":
		sReporte = "detallemovimientobodega.rpt"
	case "PACIENTES":
		sReporte = "detallemovimientopaciente.rpt"
	case "SOLICITUDES":
		sReporte = "detallesolgastoservicio.rpt"
	case "SOLICITUDESACENTRALES":
		sReporte = "detallesolbodegacentral.rpt"
	}

	sTipo = filtro.TipoReport
	sIDReport = strconv.FormatInt(intIDReport, 10)

	sPrompt = "&prompt0=" + sIDReport
	sPrompt = sPrompt + "&prompt1=" + strconv.Itoa(filtro.Esacodigo)

	strURL, err = ObtieneURL(sReporte, sTipo, sPrompt, sIDReport, filtro.Servidor)
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
