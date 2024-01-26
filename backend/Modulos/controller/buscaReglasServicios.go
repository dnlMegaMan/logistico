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

// BuscaReglasServicios is...
func BuscaReglasServicios(w http.ResponseWriter, r *http.Request) {
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
	var msg models.EstructuraReglas
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

	res := models.EstructuraReglas{}
	json.Unmarshal([]byte(output), &res)

	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	models.EnableCors(&w)
	db, _ := database.GetConnection(res.Servidor)

	query := "select REGLA_TIPOBODEGA, REGLA_BODEGACODIGO, REGLA_ID_PRODUCTO, REGLA_BODEGAMEDICAMENTO, REGLA_BODEGAINSUMOS, REGLA_BEDEGACONTROLADOS, REGLA_BODEGACONSIGNACION, CODIGO_SERVICIO "
	query += " from clin_far_reglas where  "
	query += " regla_hdgcodigo = " + strconv.Itoa(res.HDGCodigo)
	query += " AND regla_esacodigo = " + strconv.Itoa(res.ESACodigo)
	query += " and regla_cmecodigo = " + strconv.Itoa(res.CMECodigo)
	query += " and codigo_servicio = '" + res.CodigoServicio + "'"
	query += " and regla_tipo = '" + res.Reglatipo + "'"

	ctx := context.Background()
	rows, err := db.QueryContext(ctx, query)

	logger.Trace(logs.InformacionLog{Query: query, Mensaje: "Query busca reglas servicios"})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query busca reglas servicios",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	defer rows.Close()

	retornoValores := []models.Reglas{}
	for rows.Next() {
		valores := models.Reglas{}

		err := rows.Scan(
			&valores.Reglatipobodega,
			&valores.ReglaBodegaCodigo,
			&valores.ReglaIDProducto,
			&valores.ReglaBodegaMedicamento,
			&valores.ReglaBodegaInsumos,
			&valores.ReglaBedegaControlados,
			&valores.ReglaBodegaConsignacion,
			&valores.CODIGOSERVICIO,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan busca reglas servicios",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		retornoValores = append(retornoValores, valores)
	}

	json.NewEncoder(w).Encode(retornoValores)
	models.EnableCors(&w)
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
