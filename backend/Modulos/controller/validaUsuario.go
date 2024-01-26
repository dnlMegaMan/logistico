package controller

import (
	"context"
	"crypto/md5"
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"net/http"
	"strings"

	"sonda.com/logistico/Modulos/comun"
	"sonda.com/logistico/Modulos/models"
	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"
)

func ValidaUsuario(w http.ResponseWriter, r *http.Request) {
	// Obtener un logger y registrar la entrada
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	models.EnableCors(&w)
	// Read and unmarshal request body
	var requestMessage models.ParamUsuario

	err := comun.ParseRequestBody(r, &requestMessage)
	if err != nil {
		comun.HandleError(w, "Error validating request", err, http.StatusInternalServerError, logger)
		return
	}

	// Marshal and log request
	comun.LogAndMarshalRequest(w, &requestMessage, logger)

	// Get database connection
	con, err := database.GetConnection(requestMessage.PiServidor)
	if err != nil {
		comun.HandleError(w, "Error al conectarse a la BD", err, http.StatusInternalServerError, logger)
		return
	}
	defer con.Close()

	handleQueryValidaUsuario(con, w, requestMessage, logger)

	w.Header().Set("Content-Type", "application/json")
	logger.LoguearSalida()
}

func handleQueryValidaUsuario(con *sql.DB, w http.ResponseWriter, requestMessage models.ParamUsuario, logger *logs.LogisticoLogger) {
	ctx := context.Background()
	pUsuario := requestMessage.PiUsuario
	md5HashInBytes := md5.Sum([]byte(requestMessage.PiClave))
	pClave := hex.EncodeToString(md5HashInBytes[:])
	PServidor := requestMessage.PiServidor

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

	query1 := getValidaUsuarioQuery() // Puedes definir esta función para obtener la consulta SQL

	var retornoValores []models.RetornoUsuario
	valores := map[string]interface{}{
		"pUsuario": pUsuario,
		"pClave":   pClave,
	}

	if err := comun.PrepareQuery(ctx, con, tx, query1, &retornoValores, valores); err != nil {
		comun.HandleError(w, "Se cayo query busca usuarios", err, http.StatusInternalServerError, logger)
		return
	}

	token, err := LlamadaGeneraToken(pUsuario, requestMessage.PiClave, retornoValores[0].HDGNombre, PServidor)
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "Se cayo generacion de token",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	token = strings.Replace(token, "{\"token\":\"", "", 5)
	token = strings.Replace(token, "\"}", "", 5)
	token = strings.Replace(token, "\":\"", "", 5)

	retornoValores[0].Token = token

	err = tx.Commit()
	if err != nil {
		comun.HandleTransactionCommitError(err, logger, tx)
		return
	}

	// Enviar la respuesta
	json.NewEncoder(w).Encode(retornoValores)
}

func getValidaUsuarioQuery() string {
	return `
	SELECT  US.FLD_USERID, CO.HDGCODIGO, HO.HDGNOMBRE, CO.ESACODIGO, ES.ESANOMBRE, CO.CMECODIGO, SU.CMENOMBRE, '' TOKEN
	FROM TBL_USER US, CONFIGURACIONCONEXION CO, TBL_CONTROLCLAVEUSR CUS,HOLDING HO, EMPRESA ES, CENTROMEDICO SU,CLIN_FAR_ROLES_USUARIOS 
	WHERE CO.USUARIO = US.FLD_USERCODE 
	  AND HO.HDGCODIGO = CO.HDGCODIGO 
	  AND ES.HDGCODIGO = CO.HDGCODIGO 
	  AND ES.ESACODIGO = CO.ESACODIGO 
	  AND SU.HDGCODIGO = CO.HDGCODIGO 
	  AND SU.ESACODIGO = CO.ESACODIGO 
	  AND SU.CMECODIGO = CO.CMECODIGO 
	  AND CLIN_FAR_ROLES_USUARIOS.ID_USUARIO = US.FLD_USERID 
	  AND CUS.FLD_USERCODE = US.FLD_USERCODE 
	  AND CUS.FLD_ESTADO = 0 
	  AND CLIN_FAR_ROLES_USUARIOS.HDGCODIGO = CO.HDGCODIGO 
	  AND CLIN_FAR_ROLES_USUARIOS.ESACODIGO = CO.ESACODIGO 
	  AND CLIN_FAR_ROLES_USUARIOS.CMECODIGO = CO.CMECODIGO 
	  AND CO.FECHATERMINO >= SYSDATE 
	  AND US.FLD_USERCODE = :pUsuario
	  AND US.FLD_USERPASSWORD = :pClave
	ORDER BY ESACODIGO 
	`
}
