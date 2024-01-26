package controller

import (
	"context"
	"database/sql"
	"encoding/json"
	"net/http"

	"sonda.com/logistico/Modulos/comun"
	"sonda.com/logistico/Modulos/models"
	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"
)

func BuscarPrestamos(w http.ResponseWriter, r *http.Request) {
	// Obtener un logger y registrar la entrada
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	models.EnableCors(&w)
	// Read and unmarshal request body
	var requestMessage models.BuscarPrestamo

	err := comun.ParseRequestBody(r, &requestMessage)
	if err != nil {
		comun.HandleError(w, "Error validating request", err, http.StatusInternalServerError, logger)
		return
	}

	// Marshal and log request
	comun.LogAndMarshalRequest(w, &requestMessage, logger)

	// Get database connection
	con, _ := database.GetConnection(requestMessage.Servidor)

	handlePCKBuscarPrestamo(con, w, requestMessage, logger)

	w.Header().Set("Content-Type", "application/json")
	logger.LoguearSalida()
}

func handlePCKBuscarPrestamo(con *sql.DB, w http.ResponseWriter, requestMessage models.BuscarPrestamo, logger *logs.LogisticoLogger) {
	ctx := context.Background()
	tx, err := con.Begin()
	if err != nil {
		comun.HandleTransactionError(err, w, logger)
		return
	}
	defer comun.HandleTransactionCleanup(tx, logger, &err)

	PKG := "PCK_FARMACIA"
	QUERY := "BEGIN PCK_FARMACIA.P_SEL_PRESTAMO(:1,:2,:3);  END;"
	Out_Json, err := comun.PrepareQueryPCK(ctx, con, w, QUERY, PKG, requestMessage, logger)
	if err != nil {
		comun.HandleTransactionError(err, w, logger)
		return
	}

	response := []models.RespuestaPrestamo{}
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

	// Enviar la respuesta
	json.NewEncoder(w).Encode(response)
}

// func BuscarPrestamos(w http.ResponseWriter, r *http.Request) {
// 	logger := logs.ObtenerLogger(logs.MainLogger)
// 	logger.LoguearEntrada()

// 	models.EnableCors(&w)

// 	w.Header().Set("Content-Type", "application/json")

// 	var requestClinfarParam models.BuscarPrestamo

// 	err := json.NewDecoder(r.Body).Decode(&requestClinfarParam)
// 	if err != nil {
// 		http.Error(w, "Error al decodificar el JSON", http.StatusBadRequest)
// 		return
// 	}

// 	db,_ := database.GetConnection(requestClinfarParam.Servidor)
// 	transaccion, err := db.Begin()
// 	if err != nil {
// 		logger.Error(logs.InformacionLog{
// 			Mensaje: "No puede crear transacción para devolver buscar prestamos",
// 			Error:   err,
// 		})
// 		http.Error(w, err.Error(), http.StatusInternalServerError)
// 		return
// 	}

// 	jsonEntrada, _ := json.Marshal(requestClinfarParam)
// 	SRV_MESSAGE := "100000"
// 	In_Json := string(jsonEntrada)
// 	Out_Json := ""

// 	logger.Trace(logs.InformacionLog{JSONEntrada: string(jsonEntrada), Mensaje: "JSON de entrada"})

// 	QUERY := "BEGIN PCK_FARMACIA.P_SEL_PRESTAMO(:1,:2,:3);  END;"
// 	_, err = transaccion.Exec(QUERY,
// 		PlSQLArrays,
// 		sql.Out{Dest: &SRV_MESSAGE}, // :1
// 		In_Json,                     //:2
// 		sql.Out{Dest: &Out_Json},    // :3
// 	)

// 	if err != nil {

// 		logger.Error(logs.InformacionLog{
// 			Mensaje: "Se cayo package buscar prestamos",
// 			Error:   err,
// 		})

// 		SRV_MESSAGE = "Error : " + err.Error()

// 		err = transaccion.Rollback()

// 		if err != nil {
// 			logger.Error(logs.InformacionLog{
// 				Mensaje: "Se cayo rollback buscar prestamos",
// 				Error:   err,
// 			})
// 			SRV_MESSAGE = "Error: " + err.Error()
// 		}
// 	}

// 	if SRV_MESSAGE != "1000000" {
// 		defer transaccion.Rollback()
// 		logger.Trace(logs.InformacionLog{
// 			Mensaje: "Rollback de grabar buscar prestamos " + SRV_MESSAGE,
// 			Error:   err,
// 		})
// 		http.Error(w, SRV_MESSAGE, http.StatusInternalServerError)
// 		return

// 	}

// 	var response models.RespuestaPrestamo
// 	json.Unmarshal([]byte(Out_Json), &response)
// 	w.WriteHeader(http.StatusOK)

// 	if response.Prestamo == nil {
// 		response = models.RespuestaPrestamo{} // Inicializar como un slice vacío
// 	}

// 	json.NewEncoder(w).Encode(response)
// }
