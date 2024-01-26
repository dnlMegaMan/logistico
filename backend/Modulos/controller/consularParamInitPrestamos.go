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

func ConsularParamInitPrestamos(w http.ResponseWriter, r *http.Request) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	models.EnableCors(&w)

	w.Header().Set("Content-Type", "application/json")

	var requestClinfarParam models.ClinfarParam

	err := json.NewDecoder(r.Body).Decode(&requestClinfarParam)
	if err != nil {
		http.Error(w, "Error al decodificar el JSON", http.StatusBadRequest)
		return
	}

	db, _ := database.GetConnection(requestClinfarParam.Servidor)
	transaccion, err := db.Begin()
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "No puede crear transacción para devolver consultar param por tipo y codigo",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	SRV_MESSAGE := "100000"
	Out_Json := ""
	QUERY := "BEGIN PCK_CLIN_FAR_PARAM_INIT_PRESTAMOS.P_CLIN_FAR_PARAM_INIT_PRESTAMOS(:1,:2); END;"
	_, err = transaccion.Exec(QUERY,
		PlSQLArrays,
		sql.Out{Dest: &SRV_MESSAGE}, // :1
		sql.Out{Dest: &Out_Json},    // :2
	)

	if err != nil {

		logger.Error(logs.InformacionLog{
			Mensaje: "Se cayo package consultar param por tipo y codigo",
			Error:   err,
		})

		SRV_MESSAGE = "Error : " + err.Error()

		err = transaccion.Rollback()

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo rollback consultar param por tipo y codigo",
				Error:   err,
			})
			SRV_MESSAGE = "Error: " + err.Error()
		}
	}

	if SRV_MESSAGE != "1000000" {
		defer transaccion.Rollback()
		logger.Trace(logs.InformacionLog{
			Mensaje: "Rollback de grabar consultar param por tipo y codigo " + SRV_MESSAGE,
			Error:   err,
		})
		http.Error(w, SRV_MESSAGE, http.StatusInternalServerError)
		return

	}

	var response models.ConsularParamInitPrestamos
	json.Unmarshal([]byte(Out_Json), &response)
	w.WriteHeader(http.StatusOK)

	if response.ConsultaListBodegas == nil {
		response = models.ConsularParamInitPrestamos{} // Inicializar como un slice vacío
	}

	json.NewEncoder(w).Encode(response)
}
