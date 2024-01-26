package controller

import (
	"database/sql"
	"encoding/json"
	ioutil "io"
	"net/http"
	"strconv"
	"strings"

	. "github.com/godror/godror"

	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"

	"sonda.com/logistico/Modulos/models"
)

// GetURLReportePedidoGastoServicio is...
func GetURLReportePrestamos(w http.ResponseWriter, r *http.Request) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

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
	var msg models.ParamReportePrestamos
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

	res := models.ParamReportePrestamos{}
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

	transaccion, err := db.Begin()
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "No puede crear transacción para devolver get Url Reporte Prestamos",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	res.ReporteID = intIDReport

	jsonEntrada, _ := json.Marshal(res)
	SRV_MESSAGE := "100000"
	In_Json := string(jsonEntrada)

	logger.Trace(logs.InformacionLog{JSONEntrada: string(jsonEntrada), Mensaje: "JSON de entrada"})

	QUERY := "BEGIN PKG_RPT_PRESTAMOS.P_RPT_PRESTAMOS(:1,:2); END;"
	_, err = transaccion.Exec(QUERY,
		PlSQLArrays,
		sql.Out{Dest: &SRV_MESSAGE}, // :1
		In_Json,                     //:2
	)

	if err != nil {

		logger.Error(logs.InformacionLog{
			Mensaje: "Se cayo package get Url Reporte Prestamos",
			Error:   err,
		})

		SRV_MESSAGE = "Error : " + err.Error()

		err = transaccion.Rollback()

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo rollback get Url Reporte Prestamos",
				Error:   err,
			})
			SRV_MESSAGE = "Error: " + err.Error()
		}
	}

	if SRV_MESSAGE != "1000000" {
		defer transaccion.Rollback()
		logger.Trace(logs.InformacionLog{
			Mensaje: "Rollback de grabar get Url Reporte Prestamos " + SRV_MESSAGE,
			Error:   err,
		})
		http.Error(w, SRV_MESSAGE, http.StatusInternalServerError)
		return

	}

	// Genera la URL
	sReporte := "rtp_prestamos.rpt"
	sTipo := "pdf"
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

	json.NewEncoder(w).Encode(valores)
	models.EnableCors(&w)
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
