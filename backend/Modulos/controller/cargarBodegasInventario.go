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

func CargarBodegasInventario(w http.ResponseWriter, r *http.Request) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	models.EnableCors(&w)

	w.Header().Set("Content-Type", "application/json")

	var requestCargarBodegasInventario models.CargarBodegasinventario

	err := json.NewDecoder(r.Body).Decode(&requestCargarBodegasInventario)
	if err != nil {
		http.Error(w, "Error al decodificar el JSON", http.StatusBadRequest)
		return
	}

	db, _ := database.GetConnection(requestCargarBodegasInventario.Servidor)
	transaccion, err := db.Begin()
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "No puede crear transacción para devolver cargar bodegas inventario",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	jsonEntrada, _ := json.Marshal(requestCargarBodegasInventario)
	SRV_MESSAGE := "100000"
	In_Json := string(jsonEntrada)
	Out_Json := ""

	logger.Trace(logs.InformacionLog{JSONEntrada: string(jsonEntrada), Mensaje: "JSON de entrada"})

	QUERY := "BEGIN PCK_FARM_INVENTARIOS.P_CARGABODEGAS(:1,:2,:3);  END;"
	_, err = transaccion.Exec(QUERY,
		PlSQLArrays,
		sql.Out{Dest: &SRV_MESSAGE}, // :1
		In_Json,                     //:2
		sql.Out{Dest: &Out_Json},    // :3
	)

	if err != nil {

		logger.Error(logs.InformacionLog{
			Mensaje: "Se cayo package cargar bodegas inventario",
			Error:   err,
		})

		SRV_MESSAGE = "Error : " + err.Error()

		err = transaccion.Rollback()

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo rollback cargar bodegas inventario",
				Error:   err,
			})
			SRV_MESSAGE = "Error: " + err.Error()
		}
	}

	if SRV_MESSAGE != "1000000" {
		defer transaccion.Rollback()
		logger.Trace(logs.InformacionLog{
			Mensaje: "Rollback de grabar cargar bodegas inventario " + SRV_MESSAGE,
			Error:   err,
		})
		http.Error(w, SRV_MESSAGE, http.StatusInternalServerError)
		return

	}

	var response []models.RespuestaCargarBodegasInventario
	json.Unmarshal([]byte(Out_Json), &response)
	w.WriteHeader(http.StatusOK)

	json.NewEncoder(w).Encode(response)
}
