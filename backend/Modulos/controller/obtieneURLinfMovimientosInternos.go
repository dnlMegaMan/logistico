package controller

import (
	"encoding/json"
	ioutil "io"
	"net/http"
	"strconv"
	"strings"

	logs "sonda.com/logistico/logging"

	"sonda.com/logistico/Modulos/models"
)

// ObtieneURLinfMovimientosInternos is...
func ObtieneURLinfMovimientosInternos(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ParamInfMovimientosInternos
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

	res := models.ParamInfMovimientosInternos{}
	json.Unmarshal([]byte(output), &res)

	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	var pTipoReport string
	var pTipoMov int
	var pTipoReg string
	var pFechaIni string
	var pFechaFin string
	var pHdgCodigo int
	var pEsaCodigo int
	var pCmeCodigo int

	pTipoReport = res.PiTipoReport
	pTipoMov = res.PiTipoMov
	pTipoReg = res.PiTipoReg
	pFechaIni = res.PiFechaIni
	pFechaFin = res.PiFechaFin
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

	_, err = db.Exec("Begin PKG_RPT_MOVIMIENTOS_INTERNOS.PRO_RPT_MOVIMIENTOS_INTERNOS(:In_Tipo_Mov,:In_Tipo_Reg,:In_Fecha_Ini,:In_Fecha_Fin,:In_IdReport,:In_HdgCodigo,:In_EsaCodigo,:In_CmeCodigo); end;", pTipoMov, pTipoReg, pFechaIni, pFechaFin, intIDReport, pHdgCodigo, pEsaCodigo, pCmeCodigo)

	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "Se cayo query al ejecutar pkg PKG_RPT_MOVIMIENTOS_INTERNOS.PRO_RPT_MOVIMIENTOS_INTERNOS",
			Error:   err,
			Contexto: map[string]interface{}{
				"pTipoMov": pTipoMov, "pTipoReg": pTipoReg, "pFechaIni": pFechaIni,
				"pFechaFin": pFechaFin, "intIDReport": intIDReport, "pHdgCodigo": pHdgCodigo,
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
	var sIDReport string
	var sPrompt string
	var strURL string

	sReporte = "logistico/rpt_movimientos_internos.rpt"
	sTipo = pTipoReport
	sIDReport = strconv.FormatInt(intIDReport, 10)
	sPrompt = "&prompt0=" + sIDReport
	strURL = ObtieneURL1(sReporte, sTipo, sPrompt, sIDReport)

	indice = 0

	valores[indice].UUrl = strURL

	indice = indice + 1

	retornoValores = valores[0:indice]

	logger.Trace(logs.InformacionLog{
		Mensaje: "Datos informe movimientos internos",
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
