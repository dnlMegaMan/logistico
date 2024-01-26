package controller

import (
	"context"
	"encoding/json"
	ioutil "io"
	"net/http"
	"strconv"
	"strings"

	"sonda.com/logistico/Modulos/models"
	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"
)

// Servicioreglas is...
func Servicioreglas(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ParamServicioReglas
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

	res := models.ParamServicioReglas{}
	json.Unmarshal([]byte(output), &res)

	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	models.EnableCors(&w)
	db, _ := database.GetConnection(res.PiServidor)

	query := "select REGLA_ID,REGLA_HDGCODIGO,REGLA_CMECODIGO,REGLA_TIPO,REGLA_TIPOBODEGA,REGLA_BODEGACODIGO,REGLA_ID_PRODUCTO,REGLA_BODEGAMEDICAMENTO,REGLA_BODEGAINSUMOS,REGLA_BEDEGACONTROLADOS,REGLA_BODEGACONSIGNACION,CODIGO_SERVICIO "
	query += "from  CLIN_FAR_REGLAS where "
	query += " codigo_servicio = '" + res.CodServicioActual + "'"
	query += " AND regla_hdgcodigo = " + strconv.Itoa(res.HdgCodigo)
	query += " AND regla_cmecodigo = " + strconv.Itoa(res.CmeCodigo)
	query += " AND REGLA_TIPO = 'INPUT-PORDUCTO-SOLICTUD-PACIENTE' "

	ctx := context.Background()
	rows, err := db.QueryContext(ctx, query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query servicio reglas",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query servicio reglas",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	retornoValores := []models.ServicioReglas{}
	for rows.Next() {
		valores := models.ServicioReglas{}

		err := rows.Scan(
			&valores.Reglaid,
			&valores.Reglahdgcodigo,
			&valores.Reglacmecodigo,
			&valores.Reglatipo,
			&valores.Reglatipobodega,
			&valores.Reglabodegacodigo,
			&valores.Reglaidproducto,
			&valores.Reglabodegamedicamento,
			&valores.Reglabodegainsumos,
			&valores.Reglabedegacontrolados,
			&valores.Reglabodegaconsignacion,
			&valores.Codigoservicio,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan servicio reglas",
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
