package controller

import (
	"context"
	"database/sql"
	"encoding/json"
	"net/http"

	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"

	"sonda.com/logistico/Modulos/comun"
	"sonda.com/logistico/Modulos/models"
)

// ListaPedidoSugerido is...
func ListaPedidoSugerido(w http.ResponseWriter, r *http.Request) {
	// Obtener un logger y registrar la entrada
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	models.EnableCors(&w)
	// Read and unmarshal request body
	var requestMessage models.ParamPedidoSugerido

	err := comun.ParseRequestBody(r, &requestMessage)
	if err != nil {
		comun.HandleError(w, "Error validating request", err, http.StatusInternalServerError, logger)
		return
	}

	// Marshal and log request
	comun.LogAndMarshalRequest(w, &requestMessage, logger)

	// Get database connection
	con, _ := database.GetConnection(requestMessage.Servidor)

	handlePCKLstPedSugerido(con, w, requestMessage, logger)

	w.Header().Set("Content-Type", "application/json")
	logger.LoguearSalida()
}

func handlePCKLstPedSugerido(con *sql.DB, w http.ResponseWriter, requestMessage models.ParamPedidoSugerido, logger *logs.LogisticoLogger) {
	ctx := context.Background()
	tx, err := con.Begin()
	if err != nil {
		comun.HandleTransactionError(err, w, logger)
		return
	}
	defer comun.HandleTransactionCleanup(tx, logger, &err)

	PKG := "PKG_PEDIDO_SUGERIDO"
	QUERY := "BEGIN PKG_PEDIDO_SUGERIDO.P_LISTA_PEDIDO_SUGERIDO(:1,:2,:3); END;"
	Out_Json, err := comun.PrepareQueryPCK(ctx, con, w, QUERY, PKG, requestMessage, logger)
	if err != nil {
		comun.HandleTransactionError(err, w, logger)
		return
	}

	bodegas := []models.ParamPedidoSugerido{}
	err = json.Unmarshal([]byte(Out_Json), &bodegas)
	if err != nil {
		comun.HandleError(w, "No puede hacer unmarshal del JSON de salida", err, http.StatusInternalServerError, logger)
		return
	}

	err = tx.Commit()
	if err != nil {
		comun.HandleTransactionCommitError(err, logger, tx)
		return
	}

	// Enviar la respuesta
	json.NewEncoder(w).Encode(bodegas)
}
