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

// CreaCierreLibroMedControlados is...
func CreaCierreLibroMedControlados(w http.ResponseWriter, r *http.Request) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	models.EnableCors(&w)
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
	var msg models.PCierreLibroMedControlados
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
	w.Header().Set("Content-Type", "application/json")
	res := models.PCierreLibroMedControlados{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.PiUsuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	mensaje := "OK"

	db, _ := database.GetConnection(res.PiServidor)
	//}

	qry := " BEGIN"
	qry = qry + " GENERA_CIERRE_CONTROLADOS_PKG.GENERA_CIERRE_CONTROLADOS("
	qry = qry + " " + strconv.Itoa(res.PiHDGCodigo)
	qry = qry + " ," + strconv.Itoa(res.PiESACodigo)
	qry = qry + " ," + strconv.Itoa(res.PiCMECodigo)
	qry = qry + " ," + strconv.Itoa(res.PiCodBodegaControlados)
	qry = qry + " , '" + res.PiUsuario + "'"
	qry = qry + " );"
	qry = qry + " END;"

	ctx := context.Background()
	rowsUp, err := db.QueryContext(ctx, qry)

	logger.Trace(logs.InformacionLog{
		Query:   qry,
		Mensaje: "Query crea cierre libro medicamentos controlados",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   qry,
			Mensaje: "Se cayo query crea cierre libro medicamentos controlados",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rowsUp.Close()

	models.EnableCors(&w)
	var valores models.RetornaMensaje
	valores.Mensaje = mensaje
	var retornoValores models.RetornaMensaje = valores
	json.NewEncoder(w).Encode(retornoValores)
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
