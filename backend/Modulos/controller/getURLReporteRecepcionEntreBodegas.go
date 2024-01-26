package controller

import (
	"context"
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"

	"sonda.com/logistico/Modulos/models"
)

// GetURLDespacharSolicBod is...
func GetURLReporteRecepcionEntreBodegas(w http.ResponseWriter, r *http.Request) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	models.EnableCors(&w)
	w.Header().Set("Content-Type", "application/json")

	// UNMARSHAL
	res := models.GetURLReporteRecepcionEntreBodegasRequest{}
	err := json.NewDecoder(r.Body).Decode(&res)
	if err != nil {
		if strings.ToUpper(r.Method) != "OPTIONS" {
			logger.Error(logs.InformacionLog{
				Mensaje: "No puede hacer unmarshal del JSON de entrada",
				Error:   err,
			})
		}

		http.Error(w, err.Error(), http.StatusOK)
		return
	}

	logger.SetUsuario(res.Usuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	idReport, err := ObtieneidReport(res.Servidor)
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "Fallo obtencion del ID del reporte",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// QUERY REPORTE
	qry := " BEGIN"
	qry += " PKG_RPT_RECEPCION_SOLICITUDES_ENTRE_BODEGAS.PRO_CREAR_REPORTE_DE_RECEPCION("
	qry += " " + strconv.FormatInt(idReport, 10)
	qry += " ," + strconv.Itoa(res.HdgCodigo)
	qry += " ," + strconv.Itoa(res.EsaCodigo)
	qry += " ," + strconv.Itoa(res.CmeCodigo)
	qry += " ," + strconv.Itoa(res.SolicitudId)
	qry += " ); "
	qry += " END; "

	logger.Trace(logs.InformacionLog{
		Query:   qry,
		Mensaje: "Query package reporte despachar solicitud bodega",
	})

	db, _ := database.GetConnection(res.Servidor)
	ctx := context.Background()
	_, err = db.ExecContext(ctx, qry)

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   qry,
			Mensaje: "Se cayo query package reporte despachar solicitud bodega",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// CREAR URL REPORTE
	strURL, err := ObtieneURL(
		"recepcion_solicitud_entre_bodegas.rpt",
		res.TipoReport,
		"&prompt0="+strconv.FormatInt(idReport, 10),
		strconv.FormatInt(idReport, 10),
		res.Servidor,
	)

	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "Fallo obtencion de la URL del reporte",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// OK
	json.NewEncoder(w).Encode(models.URLReport{
		UUrl: strURL,
	})

	logger.LoguearSalida()
}
