package controller

import (
	"context"
	"fmt"
	"net/http"

	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"

	"sonda.com/logistico/Modulos/models"
)

// EchoString is...
func EchoString(w http.ResponseWriter, r *http.Request) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	fmt.Fprintf(w, "Servicio no Definido.")

	models.EnableCors(&w)
	w.Header().Set("Content-Type", "application/json")

	//  var PUsuario  string

	var PiServidor string

	//  PUsuario   = res.PiUsuario
	PiServidor = "TESTING"

	db, _ := database.GetConnection(PiServidor)

	// db, err := conectarBaseDeDatos("Servidor")

	query := "select * from dual"
	ctx := context.Background()

	rows, err := db.QueryContext(ctx, query)

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query echo string",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	// defer db.Close()

	indice := 0
	for rows.Next() {
		var refCursor interface{}
		if err := rows.Scan(&refCursor); err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan echo string",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		indice++
	}

	models.EnableCors(&w)

	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
