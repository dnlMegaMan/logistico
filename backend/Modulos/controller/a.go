package controller

import (
	"context"
	"encoding/json"
	"net/http"

	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"

	"sonda.com/logistico/Modulos/models"
)

func A(w http.ResponseWriter, r *http.Request) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	models.EnableCors(&w)
	w.Header().Set("Content-Type", "application/json")

	// UNMARSHAL
	res := models.BuscaProdPorLoteEntra{} // <====== CAMBIAR POR EL MODELO CORRECTO
	err := json.NewDecoder(r.Body).Decode(&res)
	if err != nil {
		// Hay que agregar el middleware "Prefligth" para evitar problemas por
		// CORS en esta parte
		logger.Error(logs.InformacionLog{
			Mensaje: "No puede hacer unmarshal del JSON de entrada",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// ARMAR QUERY
	query := " SELECT "
	query += "     dato1, dato2 "
	query += " FROM "
	query += "     tabla "

	// EJECUTAR QUERY
	db, _ := database.GetConnection(res.Servidor)
	ctx := context.Background()
	rows, err := db.QueryContext(ctx, query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query <descripcion_proposito_query>", // <====== CAMBIAR PROPOSITO QUERY
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query <descripcion_proposito_query>", // <====== CAMBIAR PROPOSITO QUERY
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	// LEER RESULTADO QUERY
	retornoValores := []models.BuscaProdPorLoteSalida{} // <====== CAMBIAR POR EL MODELO CORRECTO
	for rows.Next() {
		valores := models.BuscaProdPorLoteSalida{} // <====== CAMBIAR POR EL MODELO CORRECTO

		err := rows.Scan(
			&valores.CMECodigo,
			&valores.CodBodega,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan <descripcion_proposito_query>", // <====== CAMBIAR PROPOSITO QUERY
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		retornoValores = append(retornoValores, valores)
	}

	// OK
	json.NewEncoder(w).Encode(retornoValores)

	logger.LoguearSalida()
}
