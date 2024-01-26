package controller

import (
	"context"
	"database/sql"
	"encoding/json"
	"net/http"
	"strings"

	"sonda.com/logistico/Modulos/comun"
	"sonda.com/logistico/Modulos/models"
	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"
)

// BuscarEstructuraBodegas es un controlador HTTP que busca estructuras de bodegas.
// Gestiona la busqueda de estructuras de bodegas segun la configuracion de un parametro especifico.
func BuscarEstructuraBodegas(w http.ResponseWriter, r *http.Request) {
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

	// Get parameter value
	usaPCKLisMovInBodCab, err := comun.ObtenerClinFarParamGeneral(con, "usaPCKLisMovInBodCab")
	if err != nil {
		comun.HandleError(w, "Error getting parameter value", err, http.StatusInternalServerError, logger)
		return
	}

	// Handle based on parameter value
	if usaPCKLisMovInBodCab == comun.Si {
		handlePCKLisMovInBodCab(con, w, requestMessage, logger)
	} else {
		handleQueryLisMovInBodCab(con, w, requestMessage, logger)
	}

	w.Header().Set("Content-Type", "application/json")
	logger.LoguearSalida()
}

func handlePCKLisMovInBodCab(con *sql.DB, w http.ResponseWriter, requestMessage models.EstructuraConsultaBodega, logger *logs.LogisticoLogger) {
	ctx := context.Background()
	tx, err := con.Begin()
	if err != nil {
		comun.HandleTransactionError(err, w, logger)
		return
	}
	defer comun.HandleTransactionCleanup(tx, logger, &err)

	PKG := "PKG_BODEGA"
	QUERY := "BEGIN PKG_BODEGA.P_LISTA_ESTRUCTURA_BODEGA(:1,:2,:3); END;"
	Out_Json, err := comun.PrepareQueryPCK(ctx, con, w, QUERY, PKG, requestMessage, logger)
	if err != nil {
		comun.HandleTransactionError(err, w, logger)
		return
	}

	bodegas := []models.EstructuraBodega{}
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

func handleQueryLisMovInBodCab(con *sql.DB, w http.ResponseWriter, requestMessage models.EstructuraConsultaBodega, logger *logs.LogisticoLogger) {
	// L�gica espec�fica para usaPCKLisMovInBodCab != "SI"
	ctx := context.Background()
	bodegas := []models.EstructuraBodega{}
	pHDGCodigo := requestMessage.HDGCodigo
	pCMECodigo := requestMessage.CMECodigo
	pCodBodega := requestMessage.CodBodega
	pFboCodigoBodega := requestMessage.FboCodigoBodega
	pDesBodega := requestMessage.DesBodega
	pFbodEstado := requestMessage.FbodEstado
	pFbodTipoPorducto := requestMessage.FbodTipoPorducto
	pFbodTipoBodega := requestMessage.FbodTipoBodega

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
			FBOD_CODIGO,
			HDGCODIGO,
			ESACODIGO,
			CMECODIGO,
			FBOD_DESCRIPCION,
			FBOD_MODIFICABLE,
			FBOD_ESTADO,
			FBOD_TIPO_BODEGA,
			FBOD_TIPOPRODUCTO,
			glosatipobodega,
			glosatipoproducto,
			FBO_CODIGOBODEGA,
			FBO_FRACCIONABLE,
			fbo_despacha_receta as despachareceta
		FROM
			(
			SELECT
				FBOD_CODIGO,
				clin_far_bodegas.HDGCODIGO,
				clin_far_bodegas.ESACODIGO,
				clin_far_bodegas.CMECODIGO,
				clin_far_bodegas.fbo_despacha_receta,
				FBOD_DESCRIPCION,
				FBOD_MODIFICABLE,
				FBOD_ESTADO,
				FBOD_TIPO_BODEGA,
				FBOD_TIPOPRODUCTO,
				(
				SELECT nvl(fpar_descripcion, 'SIN TIPO BODEGA')
				FROM clin_far_param
				WHERE fpar_tipo = 51 AND fpar_valor = FBOD_TIPO_BODEGA
				) as glosatipobodega,
				(
				SELECT nvl(fpar_descripcion, 'SIN TIPO PRODUCTO')
				FROM clin_far_param
				WHERE fpar_tipo = 27 AND fpar_valor = FBOD_TIPOPRODUCTO
				) as glosatipoproducto,
				FBO_CODIGOBODEGA,
				FBO_FRACCIONABLE
			FROM
				clin_far_bodegas, tbl_user, clin_far_bodegas_usuario
			WHERE
				clin_far_bodegas.hdgcodigo = :HDGCodigo
				AND clin_far_bodegas.cmecodigo = :CMECodigo
				AND clin_far_bodegas.FBOD_TIPO_BODEGA <> 'O'
				AND clin_far_bodegas.FBOD_CODIGO = :CodBodega
				AND clin_far_bodegas.FBO_CODIGOBODEGA = :FboCodigoBodega
				AND FBOD_DESCRIPCION LIKE :DesBodega
				AND FBOD_ESTADO = :FbodEstado
				AND FBOD_TIPOPRODUCTO = :FbodTipoPorducto
				AND FBOD_TIPO_BODEGA = :FbodTipoBodega
				AND UPPER(fld_usercode) = UPPER(:Usuario)
				AND clin_far_bodegas_usuario.fbou_fld_userid = tbl_user.fld_userid
				AND clin_far_bodegas_usuario.fbou_fbod_codigo = clin_far_bodegas.fbod_codigo

			UNION

			SELECT
				FBOD_CODIGO,
				clin_far_bodegas.HDGCODIGO,
				clin_far_bodegas.ESACODIGO,
				clin_far_bodegas.CMECODIGO,
				clin_far_bodegas.fbo_despacha_receta,
				FBOD_DESCRIPCION,
				FBOD_MODIFICABLE,
				FBOD_ESTADO,
				FBOD_TIPO_BODEGA,
				FBOD_TIPOPRODUCTO,
				(
				SELECT nvl(fpar_descripcion, 'SIN TIPO BODEGA')
				FROM clin_far_param
				WHERE fpar_tipo = 51 AND fpar_valor = FBOD_TIPO_BODEGA
				) as glosatipobodega,
				(
				SELECT nvl(fpar_descripcion, 'SIN TIPO PRODUCTO')
				FROM clin_far_param
				WHERE fpar_tipo = 27 AND fpar_valor = FBOD_TIPOPRODUCTO
				) as glosatipoproducto,
				FBO_CODIGOBODEGA,
				FBO_FRACCIONABLE
			FROM
				clin_far_bodegas, tbl_user, clin_far_roles_usuarios
			WHERE
				clin_far_bodegas.hdgcodigo = :HDGCodigo
				AND clin_far_bodegas.cmecodigo = :CMECodigo
				AND clin_far_bodegas.FBOD_TIPO_BODEGA <> 'O'
				AND (clin_far_bodegas.FBOD_CODIGO = :CodBodega OR :CodBodega = 0)
				AND (clin_far_bodegas.FBO_CODIGOBODEGA = :FboCodigoBodega OR :CodBodega = '')
				AND (FBOD_DESCRIPCION LIKE :DesBodega OR :DesBodega = '')
				AND (FBOD_ESTADO = :FbodEstado OR :FbodEstado = '')
				AND (FBOD_TIPOPRODUCTO = :FbodTipoPorducto OR :FbodTipoPorducto = '')
				AND (FBOD_TIPO_BODEGA = :FbodTipoBodega OR :FbodTipoBodega = '')
				AND UPPER(fld_usercode) = UPPER(:Usuario)
				AND clin_far_roles_usuarios.id_usuario = tbl_user.fld_userid
				AND clin_far_roles_usuarios.id_rol = 0
			) ORDER BY FBOD_DESCRIPCION
		`
	var bodega models.EstructuraBodega
	valores := map[string]interface{}{
		"HDGCodigo":        pHDGCodigo,
		"CMECodigo":        pCMECodigo,
		"CodBodega":        pCodBodega,
		"FboCodigoBodega":  pFboCodigoBodega,
		"DesBodega":        "%" + strings.ToUpper(pDesBodega) + "%",
		"FbodEstado":       pFbodEstado,
		"FbodTipoPorducto": pFbodTipoPorducto,
		"FbodTipoBodega":   pFbodTipoBodega,
		"Usuario":          requestMessage.Usuario,
	}
	comun.ImprimirMapa(query1, valores, logger, "parametros de query busca estructura bodegas")
	if err := comun.PrepareQuery(ctx, con, tx, query1, &bodega, valores); err != nil {
		comun.HandleError(w, "Se cayo query busca estructura bodegas", err, http.StatusInternalServerError, logger)
		return
	}

	// QUERY PRODUCTOS BODEGA
	query2 := `
		SELECT
			NVL(INV.FBOI_ID, 0) AS FBOIID,
			NVL(INV.FBOI_FBOD_CODIGO, 0) AS FBOI_FBOD_CODIGO,
			NVL(INV.FBOI_MEIN_ID, 0) AS FBOIMEINID,
			NVL(INV.FBOI_STOCK_MAXIMO, 0) AS FBOIPTOASIGNACIO,
			NVL(INV.FBOI_PUNREO, 0) AS FBOIPTOREORDEN,
			NVL(INV.FBOI_STOCRI, 0) AS FBOISTOCCRITICO,
			NVL(INV.FBOI_STOCK_ACTUAL, 0) AS FBOISTOCACTUAL,
			NVL(INV.FBOI_NIVEL_REPOSICION, 0) AS FBOINIVELREPOSICION,
			NVL(MEIN.MEIN_DESCRI, 'Sin nombre') AS GLOSAPRODUCTO,
			NVL(MEIN.MEIN_CODMEI, 'Sin codigo') AS MEIN_CODMEI,
			NVL((SELECT PACT_DESCRI FROM CLIN_FAR_PRINCIPIO_ACT WHERE PACT_ID = MEIN.MEIN_PACT_ID), ' ') AS PRINCIPIOACTIVO,
			NVL((SELECT PRES_DESCRI FROM CLIN_FAR_PRESENTACION_MED WHERE PRES_ID = MEIN.MEIN_PRES_ID), ' ') AS PRESENTACION,
			NVL((SELECT PRES_DESCRI FROM CLIN_FAR_PRESENTACION_MED WHERE PRES_ID = MEIN_PRES_ID), ' ') AS FORMAFARMA,
			(SELECT FPAR_DESCRIPCION FROM CLIN_FAR_PARAM WHERE FPAR_TIPO = 4 AND FPAR_CODIGO = MEIN.MEIN_U_DESP) AS GLOSAUNIDAD,
			(SELECT NVL(FPAR_DESCRIPCION, ' ') FROM CLIN_FAR_PARAM WHERE FPAR_TIPO = 27 AND FPAR_VALOR = MEIN_TIPOREG) AS GLOSATIPOPODUCTO,
			NVL(INV.FBOI_BOD_CONTROLMINIMO, 'N') AS CONTROLMINIMO
		FROM
			CLIN_FAR_BODEGAS_INV INV
			JOIN CLIN_FAR_MAMEIN MEIN ON MEIN.HDGCODIGO = :HDGCodigo AND MEIN.MEIN_ID = INV.FBOI_MEIN_ID
		WHERE
			INV.FBOI_FBOD_CODIGO = :CodBodega
			AND MEIN.MEIN_CODMEI LIKE :Codmei
		ORDER BY
			MEIN.MEIN_DESCRI
		`

	bodega.Productos = make([]models.EstructuraProductosBodegas, 0)
	valores = map[string]interface{}{
		"HDGCodigo": pHDGCodigo,
		"CodBodega": pCodBodega,
		"Codmei":    "%" + requestMessage.Codmei + "%",
	}
	comun.ImprimirMapa(query2, valores, logger, "parametros de query busca estructura bodegas")
	if err = comun.PrepareQuery(ctx, con, tx, query2, &bodega.Productos, valores); err != nil {
		comun.HandleError(w, "Se cayo query busca estructura bodegas producto", err, http.StatusInternalServerError, logger)
		return
	}

	// QUERY SERVICIOS ASOCIADOS A LA BODEGA
	query3 := `
		SELECT
			bs.HDGCODIGO,
			bs.ESACODIGO,
			bs.CMECODIGO,
			bs.BS_SERV_ID,
			bs.BS_FBOD_CODIGO,
			bs.BS_VIGENTE,
			bs.CODUNIDAD,
			sl.SERV_DESCRIPCION AS GlosaServicio,
			sl.SERV_DESCRIPCION AS GlosaUnidad,
			sl.SERV_CODIGO
		FROM
			clin_far_bodega_servicio bs
		JOIN
			clin_servicios_logistico sl ON bs.bs_serv_id = sl.serv_id
		WHERE
			bs.BS_FBOD_CODIGO = :CodBodega
			AND bs.HDGCODIGO = :HDGCodigo
		`

	bodega.Servicios = make([]models.EstructuraServicioUnidadBodegas, 0)
	valores = map[string]interface{}{
		"CodBodega": pCodBodega,
		"HDGCodigo": pHDGCodigo,
	}

	comun.ImprimirMapa(query3, valores, logger, "parametros de query busca estructura bodegas")
	if err = comun.PrepareQuery(ctx, con, tx, query3, &bodega.Servicios, valores); err != nil {
		comun.HandleError(w, "Se cayo query busca estructura bodegas servicio", err, http.StatusInternalServerError, logger)
		return
	}

	// QUERY USUARIOS ASOCIADOS
	query4 := `
		SELECT
			fbou_fbod_codigo,
			fbou_fld_userid,
			fbou_id,
			tu.fld_username AS glosausuario
		FROM
			clin_far_bodegas_usuario
		JOIN
			tbl_user tu ON fbou_fld_userid = tu.fld_userid
		WHERE
			fbou_fbod_codigo = :CodBodega
		`

	bodega.Usuarios = make([]models.EstructuraUsuariosBodegas, 0)
	valores = map[string]interface{}{
		"CodBodega": bodega.CodBodega,
	}

	comun.ImprimirMapa(query4, valores, logger, "parametros de query busca estructura bodegas")
	if err = comun.PrepareQuery(ctx, con, tx, query4, &bodega.Usuarios, valores); err != nil {
		comun.HandleError(w, "Se cayo query busca estructura bodegas usuario", err, http.StatusInternalServerError, logger)
		return
	}

	// QUERY RELACIONES BODEGAS
	query5 := `
		SELECT
			HDGCODIGO,
			ESACODIGO,
			CMECODIGO,
			FBOD_CODIGO_SOLICITA,
			FBOD_CODIGO_ENTREGA,
			MEIN_TIPOREG,
			(
				SELECT NVL(FBOD_DESCRIPCION, ' ')
				FROM clin_far_bodegas
				WHERE
					fbod_estado = 'S'
					AND fbod_codigo = crb.FBOD_CODIGO_SOLICITA
					AND clin_far_bodegas.hdgcodigo = crb.hdgcodigo
					AND clin_far_bodegas.cmecodigo = crb.cmecodigo
			) AS NOM_BODEGA,
			(
				SELECT NVL(FPAR_DESCRIPCION, ' ')
				FROM clin_far_param
				WHERE
					fpar_tipo = 63
					AND fpar_codigo > 0
					AND FPAR_CODIGO = crb.MEIN_TIPOREG
			) AS TIPO_RELACION
		FROM
			clin_far_relacionbodegas crb
		WHERE
			FBOD_CODIGO_ENTREGA = :CodBodega
			AND MEIN_TIPOREG = 1
		`

	bodega.RelacionBodegas = make([]models.EstructuraRelacionBodega, 0)
	valores = map[string]interface{}{
		"CodBodega": bodega.CodBodega,
	}

	comun.ImprimirMapa(query5, valores, logger, "parametros de query busca estructura bodegas")
	if err = comun.PrepareQuery(ctx, con, tx, query5, &bodega.RelacionBodegas, valores); err != nil {
		comun.HandleError(w, "Se cayo query busca estructura bodegas relacion", err, http.StatusInternalServerError, logger)
		return
	}

	// Query Parametros Demanda
	// QUERY PRODUCTOS BODEGA
	query6 := `
		SELECT
			MEIN.MEIN_CODMEI AS CODMEI,
			MEIN.MEIN_DESCRI AS MEINDESCRI,
			MEIN.MEIN_CODIGO_CUM AS CUM,
			INV.FBOI_STOCK_ACTUAL,
			INV.FBOI_STOCK_MAXIMO,
			INV.FBOI_STOCK_MINIMO,
			INV.FBOI_STOCRI,
			INV.FBOI_NIVEL_REPOSICION
		FROM
			CLIN_FAR_BODEGAS_INV INV
		JOIN
			CLIN_FAR_MAMEIN MEIN ON MEIN.MEIN_ID = INV.FBOI_MEIN_ID
		WHERE
			INV.FBOI_FBOD_CODIGO = :CodBodega
			AND MEIN.HDGCODIGO = :HDGCodigo
		ORDER BY
			MEIN.MEIN_DESCRI
		`

	bodega.ProductosDemanda = make([]models.EstructuraProductosDemanda, 0)
	valores = map[string]interface{}{
		"CodBodega": bodega.CodBodega,
		"HDGCodigo": bodega.HDGCodigo,
	}

	comun.ImprimirMapa(query6, valores, logger, "parametros de query busca estructura bodegas")
	if err = comun.PrepareQuery(ctx, con, tx, query6, &bodega.ProductosDemanda, valores); err != nil {
		comun.HandleError(w, "Se cayo query busca estructura bodegas demanda", err, http.StatusInternalServerError, logger)
		return
	}

	err = tx.Commit()
	if err != nil {
		comun.HandleTransactionCommitError(err, logger, tx)
		return
	}
	bodegas = append(bodegas, bodega)

	// Enviar la respuesta
	json.NewEncoder(w).Encode(bodegas)
}
