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

func PeriodosInventarioValorizado(w http.ResponseWriter, r *http.Request) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	models.EnableCors(&w)
	w.Header().Set("Content-Type", "application/json")

	// Unmarshal
	var requestMessage models.EstructuraBodegaInventario

	err := comun.ParseRequestBody(r, &requestMessage)
	if err != nil {
		comun.HandleError(w, "Error validating request", err, http.StatusInternalServerError, logger)
		return
	}

	// Marshal and log request
	comun.LogAndMarshalRequest(w, &requestMessage, logger)

	// Get database connection
	con, _ := database.GetConnection(requestMessage.Servidor)

	ctx := context.Background()
	tx, err := con.Begin()
	if err != nil {
		comun.HandleTransactionError(err, w, logger)
		return
	}
	defer comun.HandleTransactionCleanup(tx, logger, &err)

	PKG := "P_PERIODOS_INVEN_BODEGAS"
	QUERY := "BEGIN PCK_FILTRO_INVENTARIO_VALORIZADO.P_PERIODOS_INVEN_BODEGAS(:1,:2,:3); END;"
	Out_Json, err := comun.PrepareQueryPCK(ctx, con, w, QUERY, PKG, requestMessage, logger)
	if err != nil {
		comun.HandleTransactionError(err, w, logger)
		return
	}

	err = tx.Commit()
	if err != nil {
		comun.HandleTransactionCommitError(err, logger, tx)
		return
	}

	retornoValores := []models.PeriodosInventario{}

	err = json.Unmarshal([]byte(Out_Json), &retornoValores)
	if err != nil {
		comun.HandleError(w, "No puede hacer unmarshal del JSON de salida", err, http.StatusInternalServerError, logger)
		return
	}

	json.NewEncoder(w).Encode(retornoValores)
	logger.LoguearSalida()
}
