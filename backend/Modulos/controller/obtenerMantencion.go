package controller

import (
	"context"
	"encoding/json"
	ioutil "io"
	"net/http"
	"strings"

	"sonda.com/logistico/Modulos/models"
	logs "sonda.com/logistico/logging"

	database "sonda.com/logistico/pkg_conexion"
)

// ObtenerMantencion is...
func ObtenerMantencion(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ParamServidor
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

	res := models.ParamServidor{}

	json.Unmarshal([]byte(output), &res)

	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	db, _ := database.GetConnection(res.PiServidorBD)

	query := " SELECT PARG_VALOR1, PARG_VALOR2 FROM CLIN_FAR_PARAM_GENERAL WHERE PARG_CODIGO = '6'  "
	ctx := context.Background()
	rows, err := db.QueryContext(ctx, query)

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query obtener mantencion",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	models.EnableCors(&w)

	valor := models.Mensaje{}
	var strVal1 string
	var strVal2 string
	for rows.Next() {
		err := rows.Scan(
			&strVal1,
			&strVal2,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan obtener mantencion",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		if strVal1 == "SI" {
			valor.ESTADO = true
			valor.MENSAJE = strVal2
			valor.FOLIO = 0
		} else {
			valor.ESTADO = false
			valor.MENSAJE = " "
			valor.FOLIO = 1
		}
	}

	json.NewEncoder(w).Encode(valor)
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
