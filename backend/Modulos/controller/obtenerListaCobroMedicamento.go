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

// ObtenerListaCobroMedicamento is...
func ObtenerListaCobroMedicamento(w http.ResponseWriter, r *http.Request) {
	// Obtener un logger y registrar la entrada
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	models.EnableCors(&w)
	// Read and unmarshal request body
	var requestMessage models.EstructuraConsultaBodega

	err := comun.ParseRequestBody(r, &requestMessage)
	if err != nil {
		comun.HandleError(w, "Error validating request", err, http.StatusInternalServerError, logger)
		return
	}

	// Marshal and log request
	comun.LogAndMarshalRequest(w, &requestMessage, logger)

	// Get database connection
	con, _ := database.GetConnection(requestMessage.Servidor)

	handleQueryLisCobroMed(con, w, requestMessage, logger)

	w.Header().Set("Content-Type", "application/json")
	logger.LoguearSalida()
}

func handleQueryLisCobroMed(con *sql.DB, w http.ResponseWriter, requestMessage models.EstructuraConsultaBodega, logger *logs.LogisticoLogger) {
	// Logica especifica para usaPCKLisMovInBodCab != "SI"
	ctx := context.Background()
	retornoValores := []models.ListaCobroMedicamentoSalida{}
	pHDGCodigo := requestMessage.HDGCodigo
	pESACodigo := requestMessage.ESACodigo
	pCMECodigo := requestMessage.CMECodigo

	tx, err := con.Begin()
	if err != nil {
		comun.HandleTransactionError(err, w, logger)
		return
	}
	defer func() {
		if err != nil {
			comun.HandleTransactionRollbackError(tx.Rollback(), logger)
		}
	}()

	query1 := `
		SELECT  
			FPAR_CODIGO, FPAR_DESCRIPCION
		FROM CLIN_FAR_PARAM
		WHERE 
			FPAR_HDGCODIGO = :HDGCodigo
		AND FPAR_ESACODIGO = " :ESACodigo
		AND FPAR_CMECODIGO = " :CMECodigo
		AND FPAR_TIPO = 105 AND FPAR_CODIGO > 0 
		`
	valores := map[string]interface{}{
		"HDGCodigo": pHDGCodigo,
		"ESACodigo": pESACodigo,
		"CMECodigo": pCMECodigo,
	}
	comun.ImprimirMapa(query1, valores, logger, "parametros de query busca estructura bodegas")
	if err := comun.PrepareQuery(ctx, con, tx, query1, &retornoValores, valores); err != nil {
		comun.HandleError(w, "Se cayo query Listar Cobro Medico", err, http.StatusInternalServerError, logger)
		return
	}

	err = tx.Commit()
	if err != nil {
		comun.HandleTransactionCommitError(err, logger, tx)
		return
	}

	valor := models.ListaCobroMedicamentoSalida{}
	valor.Codigo = 0
	valor.Descripcion = " "
	valor.Mensaje = "Exito"
	retornoValores = append([]models.ListaCobroMedicamentoSalida{valor}, retornoValores...)

	// Enviar la respuesta
	json.NewEncoder(w).Encode(retornoValores)
}
