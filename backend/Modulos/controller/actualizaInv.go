package controller

import (
	"context"
	"net/http"

	"sonda.com/logistico/Modulos/comun"

	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"

	"sonda.com/logistico/Modulos/models"
)

// ActualizaInv is...
func ActualizaInv(w http.ResponseWriter, r *http.Request) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	models.EnableCors(&w)

	var requestMessage models.ParamInvActualizar

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

	PKG := "PCK_FARM_INVENTARIOS"
	QUERY := "BEGIN PCK_FARM_INVENTARIOS.P_ACT_INV_MAN(:1,:2,:3); END;"
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

	w.Write([]byte("{ \"resultado\": \"OK\" }"))
	models.EnableCors(&w)
	logger.LoguearSalida()
}
