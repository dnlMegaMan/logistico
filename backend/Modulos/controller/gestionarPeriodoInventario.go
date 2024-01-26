package controller

import (
	"context"
	"encoding/json"
	"net/http"

	"sonda.com/logistico/Modulos/comun"
	"sonda.com/logistico/Modulos/models"
	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"
)

func GestionarPeriodoInventario(w http.ResponseWriter, r *http.Request) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	models.EnableCors(&w)

	w.Header().Set("Content-Type", "application/json")

	var requestMessage models.EstructuraObtenerUltimoPeriodoInvenario

	err := comun.ParseRequestBody(r, &requestMessage)

	if err != nil {
		comun.HandleError(w, "Error validating request", err, http.StatusInternalServerError, logger)
		return
	}

	comun.LogAndMarshalRequest(w, &requestMessage, logger)

	con, _ := database.GetConnection(requestMessage.Servidor)

	ctx := context.Background()
	tx, err := con.Begin()

	if err != nil {
		comun.HandleTransactionError(err, w, logger)
		return
	}

	defer comun.HandleTransactionCleanup(tx, logger, &err)

	PKG := "PCK_FARM_INVENTARIOS"
	QUERY := "BEGIN PCK_FARM_INVENTARIOS.P_GESTIONAR_PERIODO(:1,:2,:3); END;"
	_, err = comun.PrepareQueryPCK(ctx, con, w, QUERY, PKG, requestMessage, logger)

	if err != nil {
		comun.HandleTransactionError(err, w, logger)
		return
	}

	err = tx.Commit()
	if err != nil {
		comun.HandleTransactionCommitError(err, logger, tx)
		return
	}

	var response interface{}

	w.WriteHeader(http.StatusOK)

	response = map[string]string{
		"status": "Ok",
	}

	json.NewEncoder(w).Encode(response)
}
