package controller

import (
	"database/sql"
	"encoding/json"
	"net/http"

	. "github.com/godror/godror"

	"sonda.com/logistico/Modulos/models"
	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"
)

func ForzarCierrePrestamo(w http.ResponseWriter, r *http.Request) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	models.EnableCors(&w)

	w.Header().Set("Content-Type", "application/json")

	var respuestaPrestamo models.RespuestaForzarCierre

	err := json.NewDecoder(r.Body).Decode(&respuestaPrestamo)
	if err != nil {
		http.Error(w, "Error al decodificar el JSON", http.StatusBadRequest)
		return
	}

	db, _ := database.GetConnection(respuestaPrestamo.Servidor)
	transaccion, err := db.Begin()
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "No puede crear transacción para devolver forzar cierre",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	SRV_MESSAGE := "100000"

	QUERY := "BEGIN PKG_CREAR_PRESTAMO.P_FORZAR_CIERRE(:1,:2,:3,:4); END;"
	_, err = transaccion.Exec(QUERY,
		PlSQLArrays,
		sql.Out{Dest: &SRV_MESSAGE},     //:1
		respuestaPrestamo.ID,            //:2
		respuestaPrestamo.Usuario,       //:3
		respuestaPrestamo.Observaciones, //:4

	)

	if err != nil {

		logger.Error(logs.InformacionLog{
			Mensaje: "Se cayo package forzar cierre",
			Error:   err,
		})

		SRV_MESSAGE = "Error : " + err.Error()

		err = transaccion.Rollback()

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo rollback forzar cierre",
				Error:   err,
			})
			SRV_MESSAGE = "Error: " + err.Error()
		}
	}

	if SRV_MESSAGE != "1000000" {
		defer transaccion.Rollback()
		logger.Trace(logs.InformacionLog{
			Mensaje: "Rollback de grabar forzar cierre " + SRV_MESSAGE,
			Error:   err,
		})
		http.Error(w, SRV_MESSAGE, http.StatusInternalServerError)
		return

	}

	var response interface{}

	w.WriteHeader(http.StatusOK)

	response = map[string]string{
		"status": "Ok",
	}

	json.NewEncoder(w).Encode(response)
}
