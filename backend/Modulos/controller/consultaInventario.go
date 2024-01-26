package controller

import (
	"context"
	"encoding/json"
	"net/http"

	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"

	"sonda.com/logistico/Modulos/comun"
	"sonda.com/logistico/Modulos/models"
)

// ConsultaInventario is...
func ConsultaInventario(w http.ResponseWriter, r *http.Request) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	models.EnableCors(&w)

	w.Header().Set("Content-Type", "application/json")

	var requestMessage models.ParametrosConsInv

	err := comun.ParseRequestBody(r, &requestMessage)
	if err != nil {
		comun.HandleError(w, "Error validating request", err, http.StatusInternalServerError, logger)
		return
	}

	// Marshal and log request
	comun.LogAndMarshalRequest(w, &requestMessage, logger)

	// Get database connection
	con, _ := database.GetConnection(requestMessage.PiServidor)

	ctx := context.Background()
	tx, err := con.Begin()
	if err != nil {
		comun.HandleTransactionError(err, w, logger)
		return
	}
	defer comun.HandleTransactionCleanup(tx, logger, &err)

	PKG := "PKG_CONSULTA_INVENTARIO"
	QUERY := "BEGIN PKG_CONSULTA_INVENTARIO.P_CONSULTA_INVENTARIO(:1,:2,:3); END;"
	Out_Json, err := comun.PrepareQueryPCK(ctx, con, w, QUERY, PKG, requestMessage, logger)
	if err != nil {
		comun.HandleTransactionError(err, w, logger)
		return
	}

	response := []models.DetalleInventario{}
	err = json.Unmarshal([]byte(Out_Json), &response)
	if err != nil {
		comun.HandleError(w, "No puede hacer unmarshal del JSON de salida", err, http.StatusInternalServerError, logger)
		return
	}

	err = tx.Commit()
	if err != nil {
		comun.HandleTransactionCommitError(err, logger, tx)
		return
	}

	json.NewEncoder(w).Encode(response)
	models.EnableCors(&w)
	w.Header().Set("Content-Type", "application/json")
	logger.LoguearSalida()
}
