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

// GeneraInventario is...
func GeneraInventario(w http.ResponseWriter, r *http.Request) {
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

	PKG := "PCK_FARM_INVENTARIOS"
	QUERY := "BEGIN PCK_FARM_INVENTARIOS.P_GENERAINVENTARIO(:1,:2,:3); END;"
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

	var valores models.RespuestaGrabacion

	valores.Respuesta = "OK"

	var retornoValores models.RespuestaGrabacion = valores

	json.NewEncoder(w).Encode(retornoValores)

	logger.LoguearSalida()
}
