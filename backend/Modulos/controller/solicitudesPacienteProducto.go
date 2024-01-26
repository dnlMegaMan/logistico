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

// SolicitudesPacienteProducto is...
func SolicitudesPacienteProducto(w http.ResponseWriter, r *http.Request) {
	// Obtener un logger y registrar la entrada
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	models.EnableCors(&w)
	// Read and unmarshal request body
	var requestMessage models.ParamSolicitudesPacProd

	err := comun.ParseRequestBody(r, &requestMessage)
	if err != nil {
		comun.HandleError(w, "Error validating request", err, http.StatusInternalServerError, logger)
		return
	}

	// Marshal and log request
	comun.LogAndMarshalRequest(w, &requestMessage, logger)

	// Get database connection
	con, _ := database.GetConnection(requestMessage.PiServidor)

	// Get parameter value
	usaPCKSolPacPro, err := comun.ObtenerClinFarParamGeneral(con, "usaPCKSolPacPro")
	if err != nil {
		comun.HandleError(w, "Error validating request", err, http.StatusInternalServerError, logger)
	}
	if usaPCKSolPacPro == comun.Si {
		handlePCKSolPacProd(con, w, requestMessage, logger)
	} else {
		handleQuerySolPacProd(con, w, requestMessage, logger)
	}

	models.EnableCors(&w)
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}

func handlePCKSolPacProd(con *sql.DB, w http.ResponseWriter, requestMessage models.ParamSolicitudesPacProd, logger *logs.LogisticoLogger) {
	ctx := context.Background()
	tx, err := con.Begin()
	if err != nil {
		comun.HandleTransactionError(err, w, logger)
		return
	}
	defer comun.HandleTransactionCleanup(tx, logger, &err)

	PKG := "PCK_SOLICITUDES_PACIENTE_PRODUCTO"
	QUERY := "BEGIN PCK_SOLICITUDES_PACIENTE_PRODUCTO.P_SOLICITUDES_PACIENTE_PRODUCTO(:1,:2,:3); END;"
	Out_Json, err := comun.PrepareQueryPCK(ctx, con, w, QUERY, PKG, requestMessage, logger)
	if err != nil {
		comun.HandleTransactionError(err, w, logger)
		return
	}
	solicitudes := []models.SolicitudesPacProd{}
	err = json.Unmarshal([]byte(Out_Json), &solicitudes)
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
	json.NewEncoder(w).Encode(solicitudes)
}

func handleQuerySolPacProd(con *sql.DB, w http.ResponseWriter, requestMessage models.ParamSolicitudesPacProd, logger *logs.LogisticoLogger) {
	solicitudes := []models.SolicitudesPacProd{}
	ctx := context.Background()
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

	query := `
	SELECT SOL.SOLI_ID
		,TO_CHAR(SOL.SOLI_FECHA_CREACION, 'YYYY-MM-DD') FECHA_CREACION_SOL
		,TO_CHAR(MDET.MFDE_FECHA, 'YYYY-MM-DD HH24:MI') FECHA_DISPENSACION
		,MDET.MFDE_LOTE
		,TO_CHAR(MDET.MFDE_LOTE_FECHAVTO, 'YYYY-MM-DD') FECHAVTO
		,MDET.MFDE_ID                                   ID_MOVIMIENTODET
		,MDET.MFDE_CANTIDAD                             CANTIDAD_DISPENSADA
		,NVL((SELECT SUM(MDEV_CANTIDAD) FROM CLIN_FAR_MOVIM_DEVOL WHERE MDEV_MFDE_ID = MDET.MFDE_ID ), 0) CANTIDAD_DEVUELTA
		,DET.SODE_ID
		,DET.SODE_CANT_SOLI CANTSOLI
		,MEIN.MEIN_CODMEI MEIN_CODMEI
		,MEIN.MEIN_DESCRI  MEIN_DESCRI
		,BODO.FBOD_DESCRIPCION  BODEGAORIGEN
		,SERV.SERV_DESCRIPCION SERVICIO 
		,BODD.FBOD_DESCRIPCION BODEGADESTINO 
		,NVL(DET.SODE_CANT_A_DEV, 0) AS CANTIDAD_A_DEVOLVER 
		,NVL(DET.SODE_CANT_RECHAZO, 0) AS CANTIDAD_RECHAZO 
		,NVL(SOL.SOLI_ESTADO, 0) AS SOLI_ESTADO 
		,NVL(SOL.SOLI_BANDERA, 0) AS SOLI_BANDERA 
	FROM  CLIN_FAR_SOLICITUDES SOL 
		,CLIN_FAR_SOLICITUDES_DET DET 
		,CLIN_FAR_MOVIM           MOV 
		,CLIN_FAR_MOVIMDET        MDET
		,CLIN_FAR_MAMEIN          MEIN
		,CLIN_FAR_BODEGAS         BODO
		,CLIN_FAR_BODEGAS         BODD
		,CLIN_SERVICIOS_LOGISTICO SERV
	WHERE
		SOL.SOLI_ID = DET.SODE_SOLI_ID
	AND SOL.SOLI_HDGCODIGO = :PiHDGCodigo
	AND SOL.SOLI_ESACODIGO = :PiESACodigo
	AND SOL.SOLI_CMECODIGO = :PiCMECodigo
	AND ( SOL.SOLI_CLIID = :PiCliID OR :PiCliID = 0 )
	AND ( SOL.SOLI_CUENTA_ID = :PiCtaID OR :PiCtaID = 0 )
	AND ( SOL.SOLI_BOD_ORIGEN = :PiBodCodigo OR :PiBodCodigo = 0 )
	AND BODO.FBOD_CODIGO = SOL.SOLI_BOD_ORIGEN
	AND BODO.FBOD_CODIGO = SOL.SOLI_BOD_DESTINO
	AND SERV.ESACODIGO = SOL.SOLI_ESACODIGO
	AND SERV.SERV_CODIGO  = SOL.SOLI_CODSERVICIOACTUAL
	AND SOL.SOLI_ESTADO NOT IN ( 80, 81, 100, 110 )
	AND ( DET.SODE_MEIN_CODMEI = :PiCodMei OR :PiCodMei = '' )
	AND ( DET.SODE_LOTE = MDET.MFDE_LOTE OR DET.SODE_LOTE IS NULL )
	AND MEIN.MEIN_ID = MDET.MFDE_MEIN_ID
	AND DET.SODE_MEIN_ID = MDET.MFDE_MEIN_ID
	AND DET.SODE_SOLI_ID = MOV.MOVF_SOLI_ID
	AND MOV.MOVF_ID = MDET.MFDE_MOVF_ID
	AND MDET.MFDE_TIPO_MOV IN ( 140, 150, 160 )
	AND ( DET.SODE_SOLI_ID = :PiSoliID OR PiSoliID = 0 )
	AND ( MDET.MFDE_LOTE = :PiLote OR :PiLote = '' )
	AND ( MDET.MFDE_LOTE_FECHAVTO = TO_DATE(:PiFechaVto, 'YYYY-MM-DD') OR :PiFechaVto = '' )
	ORDER BY SOL.SOLI_ID, MDET.MFDE_ID
`
	solicitudes = make([]models.SolicitudesPacProd, 0)
	valores := map[string]interface{}{
		"PiHDGCodigo": requestMessage.PiHDGCodigo,
		"PiESACodigo": requestMessage.PiESACodigo,
		"PiCMECodigo": requestMessage.PiCMECodigo,
		"PiServidor":  requestMessage.PiServidor,
		"PiUsuario":   requestMessage.PiUsuario,
		"PiCliID":     requestMessage.PiCliID,
		"PiCtaID":     requestMessage.PiCtaID,
		"PiEstID":     requestMessage.PiEstID,
		"PiBodCodigo": requestMessage.PiBodCodigo,
		"PiCodMei":    requestMessage.PiCodMei,
		"PiSoliID":    requestMessage.PiSoliID,
		"PiLote":      requestMessage.PiLote,
		"PiFechaVto":  requestMessage.PiFechaVto,
	}

	comun.ImprimirMapa(query, valores, logger, "parametros de query busca solicitudes de pacientes por producto")
	if err = comun.PrepareQuery(ctx, con, tx, query, &solicitudes, valores); err != nil {
		comun.HandleError(w, "Se cayo query busca estructura solicitudes paciente producto", err, http.StatusInternalServerError, logger)
		return
	}
	err = tx.Commit()
	if err != nil {
		comun.HandleTransactionCommitError(err, logger, tx)
		return
	}
	json.NewEncoder(w).Encode(solicitudes)
}
