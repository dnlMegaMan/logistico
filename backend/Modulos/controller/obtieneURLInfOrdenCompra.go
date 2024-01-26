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

// ObtieneURLInfOrdenCompra is...
func ObtieneURLInfOrdenCompra(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ParamInfOrdenCompra
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

	res := models.ParamInfOrdenCompra{}
	json.Unmarshal([]byte(output), &res)

	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	var pVarOcID int
	var pHdgCodigo int
	var pEsaCodigo int
	var pCmeCodigo int
	pVarOcID = res.PiVarOcID
	pHdgCodigo = res.PiHdgCodigo
	pEsaCodigo = res.PiEsaCodigo
	pCmeCodigo = res.PiCmeCodigo

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

	_, err = db.Exec("Begin PKG_RPT_INF_ORDEN_COMPRA.PRO_RPT_INF_ORDEN_COMPRA(:In_var_oc_id,:In_IdReport,:In_HdgCodigo,:In_EsaCodigo,:In_CmeCodigo); end;", pVarOcID, intIDReport, pHdgCodigo, pEsaCodigo, pCmeCodigo)

	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "Se cayo query al ejecutar pkg PKG_RPT_INF_ORDEN_COMPRA.PRO_RPT_INF_ORDEN_COMPRA",
			Error:   err,
			Contexto: map[string]interface{}{
				"pVarOcID": pVarOcID, "intIDReport": intIDReport, "pHdgCodigo": pHdgCodigo,
				"pEsaCodigo": pEsaCodigo, "pCmeCodigo": pCmeCodigo,
			},
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	//defer db.Close()

	// Genera la URL
	var sReporte string
	var sTipo string
	var pVarOcIDAux string
	var sPrompt string
	var strURL string

	sReporte = "logistico/rpt_orden_compra.rpt"
	sTipo = "pdf"
	pVarOcIDAux = strconv.FormatInt(intIDReport, 10)
	sPrompt = "&prompt0=" + pVarOcIDAux
	strURL = ObtieneURL1(sReporte, sTipo, sPrompt, pVarOcIDAux)

	//----------
	indice = 0

	valores[indice].UUrl = strURL

	indice = indice + 1

	retornoValores = valores[0:indice]

	logger.Trace(logs.InformacionLog{
		Mensaje: "Datos informe orden de compra",
		Contexto: map[string]interface{}{
			"intIDReport": intIDReport, "strURL": strURL, "valores": valores[indice].UUrl,
			"retornoValores": retornoValores,
		},
	})

	json.NewEncoder(w).Encode(retornoValores)
	//----------

	models.EnableCors(&w)

	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
