package controller

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"

	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"

	"sonda.com/logistico/Modulos/models"
)

func InformacionGeneral(w http.ResponseWriter, r *http.Request) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	models.EnableCors(&w)
	w.Header().Set("Content-Type", "application/json")

	// Unmarshal
	res := models.InformacionGeneralEntrada{}
	err := json.NewDecoder(r.Body).Decode(&res)
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

	query := " SELECT "
	query += "     ( SELECT PARG_VALOR1 FROM CLIN_FAR_PARAM_GENERAL WHERE PARG_CODIGO = '1' ) AS VERSION_GO, "
	query += "     ( SELECT PARG_VALOR2 FROM CLIN_FAR_PARAM_GENERAL WHERE PARG_CODIGO = '1' ) AS VERSION_ANGULAR, "
	query += "     ( SELECT PARG_VALOR1 FROM CLIN_FAR_PARAM_GENERAL WHERE PARG_CODIGO = '10' ) AS REDIRIGIR_CAIDA "
	query += " FROM DUAL FETCH NEXT 1 ROW ONLY "

	// Ejecuta query
	db, _ := database.GetConnection(res.Servidor)
	ctx := context.Background()
	rows, err := db.QueryContext(ctx, query)

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query informacion general",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	// Lee informacion query
	informacionGeneral := models.InformacionGeneral{}
	for rows.Next() {
		err := rows.Scan(
			&informacionGeneral.VersionGo,
			&informacionGeneral.VersionAngular,
			&informacionGeneral.RedirigirCaidaGO,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   query,
				Mensaje: "Se cayo scan informacion general",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}

	informacionGeneral.SistemaEnMantencion = "NO"

	json.NewEncoder(w).Encode(informacionGeneral)
}
