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

// ModReglasServicio is...
func ModReglasServicio(w http.ResponseWriter, r *http.Request) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

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
	var msg models.ParamModReglas
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

	res := models.ParamModReglas{}
	json.Unmarshal([]byte(output), &res)

	models.EnableCors(&w)
	db, _ := database.GetConnection(res.PiServidor)

	var query string

	query = "BEGIN UPDATE clin_far_reglas set regla_bodegacodigo = " + strconv.Itoa(res.Bodegacontrolados)
	query = query + " ,regla_bodegamedicamento = " + strconv.Itoa(res.Bodegamedicamento)
	query = query + " ,regla_bodegaconsignacion = " + strconv.Itoa(res.Bodegaconsignacion)
	query = query + " ,regla_bedegacontrolados = " + strconv.Itoa(res.Bodegacontrolados)
	query = query + " ,regla_bodegainsumos = " + strconv.Itoa(res.Bodegainsumos)
	query = query + " WHERE codigo_servicio = '" + res.PiCodigoServicio + "' "
	query = query + " AND regla_hdgcodigo = " + strconv.Itoa(res.PiHDGCodigo)
	query = query + " AND regla_esacodigo = " + strconv.Itoa(res.PiESACodigo)
	query = query + " AND regla_cmecodigo = " + strconv.Itoa(res.PiCMECodigo)
	query = query + " ;END; "

	ctx := context.Background()
	rows, err := db.QueryContext(ctx, query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query modificar reglas servicio",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query modificar reglas servicio",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	defer rows.Close()

	json.NewEncoder(w).Encode("200, OK!")
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
