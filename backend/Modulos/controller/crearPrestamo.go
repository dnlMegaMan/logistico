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

func CrearPrestamo(w http.ResponseWriter, r *http.Request) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	models.EnableCors(&w)

	w.Header().Set("Content-Type", "application/json")

	var respuestaPrestamo models.RespuestaPrestamo

	err := json.NewDecoder(r.Body).Decode(&respuestaPrestamo)
	if err != nil {
		http.Error(w, "Error al decodificar el JSON", http.StatusBadRequest)
		return
	}

	db, _ := database.GetConnection(respuestaPrestamo.Servidor)
	transaccion, err := db.Begin()
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "No puede crear transacción para devolver crear prestamos",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	jsonEntrada, _ := json.Marshal(respuestaPrestamo)
	SRV_MESSAGE := "100000"
	In_Json := string(jsonEntrada)
	Out_Json := ""

	logger.Trace(logs.InformacionLog{JSONEntrada: string(jsonEntrada), Mensaje: "JSON de entrada"})

	QUERY := "BEGIN PKG_CREAR_PRESTAMO.P_CREAR_PRESTAMO(:1,:2,:3); END;"
	_, err = transaccion.Exec(QUERY,
		PlSQLArrays,
		sql.Out{Dest: &SRV_MESSAGE}, // :1
		In_Json,                     //:2
		sql.Out{Dest: &Out_Json},    // :3
	)

	if err != nil {

		logger.Error(logs.InformacionLog{
			Mensaje: "Se cayo package crear prestamos",
			Error:   err,
		})

		SRV_MESSAGE = "Error : " + err.Error()

		err = transaccion.Rollback()

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo rollback crear prestamos",
				Error:   err,
			})
			SRV_MESSAGE = "Error: " + err.Error()
		}
	}

	if SRV_MESSAGE != "1000000" {
		defer transaccion.Rollback()
		logger.Trace(logs.InformacionLog{
			Mensaje: "Rollback de grabar crear prestamos " + SRV_MESSAGE,
			Error:   err,
		})
		http.Error(w, SRV_MESSAGE, http.StatusInternalServerError)
		return

	}

	var response interface{}
	json.Unmarshal([]byte(Out_Json), &response)
	w.WriteHeader(http.StatusOK)

	if response == nil {
		response = map[string]string{
			"id": "",
		}
	}

	json.NewEncoder(w).Encode(response)
}
