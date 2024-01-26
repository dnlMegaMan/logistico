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

func CrearMotivoAjusteInventario(w http.ResponseWriter, r *http.Request) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	models.EnableCors(&w)

	w.Header().Set("Content-Type", "application/json")

	var requestNuevoMotivoAjusteInvenario models.RequestNuevoMotivoAjusteInvenario

	err := json.NewDecoder(r.Body).Decode(&requestNuevoMotivoAjusteInvenario)
	if err != nil {
		http.Error(w, "Error al decodificar el JSON", http.StatusBadRequest)
		return
	}

	db, _ := database.GetConnection(requestNuevoMotivoAjusteInvenario.PiServidor)
	transaccion, err := db.Begin()
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "No puede crear transacción para devolver crear nuevo motivo ajuste inventario",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	jsonEntrada, _ := json.Marshal(requestNuevoMotivoAjusteInvenario)
	SRV_MESSAGE := "100000"
	In_Json := string(jsonEntrada)

	QUERY := "BEGIN PCK_FARM_INVENTARIOS.P_GRABA_MOTIVOS(:1,:2); END;"
	_, err = transaccion.Exec(QUERY,
		PlSQLArrays,
		sql.Out{Dest: &SRV_MESSAGE}, //:1
		In_Json,                     //:2
	)

	if err != nil {

		logger.Error(logs.InformacionLog{
			Mensaje: "Se cayo package crear nuevo motivo ajuste inventario",
			Error:   err,
		})

		SRV_MESSAGE = "Error : " + err.Error()

		err = transaccion.Rollback()

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo rollback crear nuevo motivo ajuste inventario",
				Error:   err,
			})
			SRV_MESSAGE = "Error: " + err.Error()
		}
	}

	if SRV_MESSAGE != "1000000" {
		defer transaccion.Rollback()
		logger.Trace(logs.InformacionLog{
			Mensaje: "Rollback de grabar crear nuevo motivo ajuste inventario " + SRV_MESSAGE,
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
