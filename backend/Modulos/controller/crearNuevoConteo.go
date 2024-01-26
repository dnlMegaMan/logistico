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

func CrearNuevoConteo(w http.ResponseWriter, r *http.Request) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	models.EnableCors(&w)

	w.Header().Set("Content-Type", "application/json")

	var requestNuevoConteoInvenario models.RequestNuevoConteoInvenario

	err := json.NewDecoder(r.Body).Decode(&requestNuevoConteoInvenario)
	if err != nil {
		http.Error(w, "Error al decodificar el JSON", http.StatusBadRequest)
		return
	}

	db, _ := database.GetConnection(requestNuevoConteoInvenario.Servidor)
	transaccion, err := db.Begin()
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "No puede crear transacción para devolver crear nuevo conteo",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	SRV_MESSAGE := "100000"

	QUERY := "BEGIN PCK_FARM_INVENTARIOS.P_NUEVO_CONTEO_INVENARIO(:1,:2,:3); END;"
	_, err = transaccion.Exec(QUERY,
		PlSQLArrays,
		sql.Out{Dest: &SRV_MESSAGE},                 //:1
		requestNuevoConteoInvenario.InvId,           //:2
		requestNuevoConteoInvenario.HabilitarConteo, //:3

	)

	if err != nil {

		logger.Error(logs.InformacionLog{
			Mensaje: "Se cayo package crear nuevo conteo",
			Error:   err,
		})

		SRV_MESSAGE = "Error : " + err.Error()

		err = transaccion.Rollback()

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo rollback crear nuevo conteo",
				Error:   err,
			})
			SRV_MESSAGE = "Error: " + err.Error()
		}
	}

	if SRV_MESSAGE != "1000000" {
		defer transaccion.Rollback()
		logger.Trace(logs.InformacionLog{
			Mensaje: "Rollback de grabar crear nuevo conteo " + SRV_MESSAGE,
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
