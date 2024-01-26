package controller

import (
	"encoding/json"
	ioutil "io"
	"net/http"
	"strconv"
	"strings"

	"sonda.com/logistico/Modulos/models"
	logs "sonda.com/logistico/logging"
)

// ObtieneURLinfAuditoriaPrecios is...
func ObtieneURLinfAuditoriaPrecios(w http.ResponseWriter, r *http.Request) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	var retornoValores []models.URLReport
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
	var msg models.ParamInfAuditoriaPrecios
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

	res := models.ParamInfAuditoriaPrecios{}
	json.Unmarshal([]byte(output), &res)

	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	var PTipoReport string
	var PHdgCodigo int
	var PEsaCodigo int
	var PCmeCodigo int

	PTipoReport = res.PiTipoReport
	PHdgCodigo = res.PiHdgCodigo
	PEsaCodigo = res.PiEsaCodigo
	PCmeCodigo = res.PiCmeCodigo

	// Obtiene el IdReport
	intIDReport, err := ObtieneidReport1()
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "Fallo obtencion del ID del reporte",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	db, err := ConectarBaseDeDatos1()
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "Se cayo conexion a base de datos 1",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	_, err = db.Exec("Begin PKG_RPT_AUDITORIA_PRECIOS.PRO_RPT_AUDITORIA_PRECIOS(:In_IdReport,:In_HdgCodigo,:In_EsaCodigo,:In_CmeCodigo); end;", intIDReport, PHdgCodigo, PEsaCodigo, PCmeCodigo)

	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "Se cayo query  al ejecutar pkg PKG_RPT_AUDITORIA_PRECIOS.PRO_RPT_AUDITORIA_PRECIOS",
			Error:   err,
			Contexto: map[string]interface{}{
				"intIDReport": intIDReport, "PHdgCodigo": PHdgCodigo, "PEsaCodigo": PEsaCodigo, "PCmeCodigo": PCmeCodigo,
			},
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	//defer db.Close()

	// Genera la URL
	var sReporte string
	var sTipo string
	var sIDReport string
	var sPrompt string
	var strURL string

	sReporte = "logistico/rpt_auditoria_de_precios.rpt"
	sTipo = PTipoReport
	sIDReport = strconv.FormatInt(intIDReport, 10)
	sPrompt = "&prompt0=" + sIDReport
	strURL = ObtieneURL1(sReporte, sTipo, sPrompt, sIDReport)

	indice = 0

	valores[indice].UUrl = strURL

	indice = indice + 1

	retornoValores = valores[0:indice]

	logger.Trace(logs.InformacionLog{
		Mensaje: "Datos informe auditoria precios",
		Contexto: map[string]interface{}{
			"intIDReport": intIDReport, "strURL": strURL, "valores": valores[indice].UUrl,
			"retornoValores": retornoValores,
		},
	})

	json.NewEncoder(w).Encode(retornoValores)

	models.EnableCors(&w)

	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
