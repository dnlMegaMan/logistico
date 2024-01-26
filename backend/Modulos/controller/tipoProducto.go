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

// TipoProducto is...
func TipoProducto(w http.ResponseWriter, r *http.Request) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	models.EnableCors(&w)

	w.Header().Set("Content-Type", "application/json")

	var res models.ClinfarParam
	err := json.NewDecoder(r.Body).Decode(&res)
	if err != nil {
		http.Error(w, "Error al decodificar el JSON", http.StatusBadRequest)
		return
	}
	db, _ := database.GetConnection(res.Servidor)
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
	QUERY := "BEGIN PKG_TIPO_PRODUCTO.PRO_TIPO_PRODUCTO(:1,:2); END;"
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

	var response []models.ClinfarParam
	json.Unmarshal([]byte(Out_Json), &response)
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
	logger.LoguearSalida()
}
