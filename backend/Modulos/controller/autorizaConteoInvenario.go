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

func AutorizaConteoInvenario(w http.ResponseWriter, r *http.Request) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	models.EnableCors(&w)

	w.Header().Set("Content-Type", "application/json")

	var requestAutorizaConteoInvenario models.RequestAutorizaConteoInvenario

	err := json.NewDecoder(r.Body).Decode(&requestAutorizaConteoInvenario)
	if err != nil {
		http.Error(w, "Error al decodificar el JSON", http.StatusBadRequest)
		return
	}

	db, _ := database.GetConnection(requestAutorizaConteoInvenario.Servidor)
	transaccion, err := db.Begin()
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "No puede crear transacción para devolver autoriza conteo invenario",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	SRV_MESSAGE := "100000"

	QUERY := "BEGIN PCK_FARM_INVENTARIOS.P_AUTORIZA_CONTEO_INVENARIO(:1,:2,:3,:4); END;"
	_, err = transaccion.Exec(QUERY,
		PlSQLArrays,
		sql.Out{Dest: &SRV_MESSAGE},                  //:1
		requestAutorizaConteoInvenario.InvId,         //:2
		requestAutorizaConteoInvenario.Usuario,       //:3
		requestAutorizaConteoInvenario.Observaciones, //:4

	)

	if err != nil {

		logger.Error(logs.InformacionLog{
			Mensaje: "Se cayo package autoriza conteo invenario",
			Error:   err,
		})

		SRV_MESSAGE = "Error : " + err.Error()

		err = transaccion.Rollback()

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo rollback autoriza conteo invenario",
				Error:   err,
			})
			SRV_MESSAGE = "Error: " + err.Error()
		}
	}

	if SRV_MESSAGE != "1000000" {
		defer transaccion.Rollback()
		logger.Trace(logs.InformacionLog{
			Mensaje: "Rollback de grabar autoriza conteo invenario " + SRV_MESSAGE,
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
