package controller

import (
	"context"
	"encoding/json"
	ioutil "io"
	"net/http"
	"strconv"
	"strings"

	"sonda.com/logistico/Modulos/models"
	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"
)

// SelCierreKardexProdBod is...
func SelCierreKardexProdBod(w http.ResponseWriter, r *http.Request) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	models.EnableCors(&w)
	w.Header().Set("Content-Type", "application/json")
	// Read body
	b, err := ioutil.ReadAll(r.Body)
	defer r.Body.Close()
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "No puede leer cuerpo de la peticion",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	// Unmarshal
	var msg models.PSelCierreKardexProdBod
	err = json.Unmarshal(b, &msg)
	if err != nil {
		if strings.ToUpper(r.Method) != "OPTIONS" { // Solo si no es un Pre-flight del chrome
			logger.Error(logs.InformacionLog{
				Mensaje: "No puede hacer unmarshal del JSON de entrada",
				Error:   err,
			})
		}

		http.Error(w, err.Error(), http.StatusOK)
		return
	}
	//Marshal
	output, err := json.Marshal(msg)
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "No puede volver a crear JSON",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return

	}

	res := models.PSelCierreKardexProdBod{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.PiUsuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	db, _ := database.GetConnection(res.PiServidor)

	var qry string

	if res.KaDeID > 0 {
		qry = "select CKAR_ID"
		qry = qry + ", KADE_MOVF_BOD_SUMINISTRO"
		qry = qry + ", KADE_MEIN_ID"
		qry = qry + ", (SELECT TRIM(MEIN_CODMEI) FROM clin_far_mamein WHERE KADE_MEIN_ID = mein_id(+) AND hdgcodigo = per.HDGCODIGO) MEIN_CODMEI"
		qry = qry + ", (SELECT TRIM(mein_descri) FROM clin_far_mamein WHERE KADE_MEIN_ID = mein_id(+) AND hdgcodigo = per.HDGCODIGO) mein_descri"
		qry = qry + ", to_char(KADE_MFDE_FECHA, 'dd-mm-yyyy hh24:mi:ss') KADE_MFDE_FECHA"
		qry = qry + ", decode (KADE_MOVF_TIPO , 0, 'Sin Descripcion',nvl((select INITCAP(FPAR_DESCRIPCION) from clin_far_param where FPAR_TIPO = 8 and FPAR_CODIGO = KADE_MOVF_TIPO), ' ')) FPAR_DESCRIPCION"
		qry = qry + ", CASE KADE_MOVF_TIPO "
		qry = qry + "         WHEN 115 THEN decode (KADE_MFDE_IDTIPOMOTIVO , 0, 'Sin Descripcion',nvl((select INITCAP(FPAR_DESCRIPCION) from clin_far_param where FPAR_TIPO = 16 and FPAR_CODIGO = KADE_MFDE_IDTIPOMOTIVO), ' ')) "
		qry = qry + "         WHEN 15  THEN decode (KADE_MFDE_IDTIPOMOTIVO , 0, 'Sin Descripcion',nvl((select INITCAP(FPAR_DESCRIPCION) from clin_far_param where FPAR_TIPO = 16 and FPAR_CODIGO = KADE_MFDE_IDTIPOMOTIVO), ' ')) "
		qry = qry + "         ELSE  decode (KADE_MFDE_IDTIPOMOTIVO , 0, 'Sin Descripcion',nvl((select INITCAP(FPAR_DESCRIPCION) from clin_far_param where FPAR_TIPO = 18 and FPAR_CODIGO = KADE_MFDE_IDTIPOMOTIVO), ' ')) "
		qry = qry + "      END  tipomotivodes"
		qry = qry + ", nvl((select FBOD_DESCRIPCION from clin_far_bodegas where FBOD_CODIGO = KADE_MOVF_BOD_SUMINISTRO and  HDGCODIGO = per.HDGCODIGO "
		qry = qry + "                                                    and ESACODIGO = " + strconv.Itoa(res.PiESACodigo)
		qry = qry + "                                                    and CMECODIGO = per.CMECODIGO), 'Sin Descripcion' ) FBOD_DESCRIPCION"
		qry = qry + ", nvl(KADE_MOVF_RECETA, 0 ) KADE_MOVF_RECETA"
		qry = qry + ", nvl(KADE_CLINUMIDENTIFICACION_PROF, ' ') KADE_CLINUMIDENTIFICACION_PROF"
		qry = qry + ", INITCAP( (KADE_CLINOMBRES_PROF || ' ' || KADE_CLIAPEPATERNO_PROF || ' ' || KADE_CLIAPEMATERNO_PROF) ) NombreProf"
		qry = qry + ", nvl(KADE_CLINUMIDENTIFICACION, ' ') KADE_CLINUMIDENTIFICACION "
		qry = qry + ", INITCAP( (KADE_CLINOMBRES || ' ' || KADE_CLIAPEPATERNO || ' ' || KADE_CLIAPEMATERNO) ) NombrePac"
		qry = qry + ", decode(KADE_OPERACION, 'S',   KADE_MFDE_CANTIDAD, 0) cantidad_entrada"
		qry = qry + ", decode(KADE_OPERACION, 'R',   KADE_MFDE_CANTIDAD, 0) cantidad_salida"
		qry = qry + ", nvl(KADE_STOCK_SALDO, 0) KADE_STOCK_SALDO"
		qry = qry + ", nvl((select FBOD_DESCRIPCION from clin_far_bodegas where FBOD_CODIGO = KADE_MOVF_BOD_EXTERNA and  HDGCODIGO = per.HDGCODIGO "
		qry = qry + "                                                    and ESACODIGO = " + strconv.Itoa(res.PiESACodigo)
		qry = qry + "                                                    and CMECODIGO = per.CMECODIGO), ' ' ) FBodExternaDesc"
		qry = qry + ", nvl(kade_MOVF_SOLI_ID,0) KADE_MOVF_SOLI_ID "
		qry = qry + ", nvl(KADE_REFERENCIA_FIN700,0) KADE_REFERENCIA_FIN700 "
		qry = qry + ", nvl(KADE_LOTE,'') KADE_LOTE "
		qry = qry + ", nvl(KADE_ERROR_ERP, '') IntErpError "
		qry = qry + " from CLIN_FAR_CIERRE_KARDEX_PERIODO per"
		qry = qry + "    , CLIN_FAR_CIERRE_KARDEX_DET  det"
		qry = qry + " where per.CKAR_ID  = " + strconv.Itoa(res.KaDeID)
		qry = qry + " and per.HDGCODIGO = " + strconv.Itoa(res.PiHDGCodigo)
		qry = qry + " and per.CMECODIGO = " + strconv.Itoa(res.PiCMECodigo)
		qry = qry + " and per.CKAR_ID  = det.KADE_CKAR_ID"
		qry = qry + " and KADE_MOVF_BOD_SUMINISTRO = " + strconv.Itoa(res.CodBodega)
		if res.MeInID != 0 {
			qry = qry + " and det.KADE_MEIN_ID = " + strconv.Itoa(res.MeInID)
		}
		qry = qry + " order by det.KADE_ID"

	} else {
		qry = qry + " SELECT "
		qry = qry + " 	  KADEID "
		qry = qry + " 	, CODBODEGA "
		qry = qry + " 	, MEINID "
		qry = qry + " 	, MEINCODMEI "
		qry = qry + " 	, MEINDESCRI "
		qry = qry + " 	, MOVIMFECHA "
		qry = qry + " 	, MOVIMDESCRI "
		qry = qry + " 	, TIPOMOTIVODES "
		qry = qry + " 	, FBODDESCRI "
		qry = qry + " 	, NRORECETA "
		qry = qry + " 	, RUTPROF "
		qry = qry + " 	, NOMBREPROF "
		qry = qry + " 	, RUTPACIENTE "
		qry = qry + " 	, NOMBREPACIENTE "
		qry = qry + " 	, CANTIDADENTRADA "
		qry = qry + " 	, CANTIDADSALIDA "
		qry = qry + "   , CANTIDADSALDO "
		qry = qry + " 	, FBODSUMINISTRO "
		qry = qry + " 	, FBODEXTERNADESC "
		qry = qry + " 	, SOLIID "
		qry = qry + " 	, REFERENCIA "
		qry = qry + " 	, LOTE "
		qry = qry + " 	, INTERPERROR "
		qry = qry + " FROM( "
		qry = qry + " 	SELECT "
		qry = qry + " " + strconv.Itoa(res.KaDeID) + " KADEID "
		qry = qry + " 		, MOV.MOVF_BOD_ORIGEN CODBODEGA "
		qry = qry + " 		, MEIN.MEIN_ID MEINID "
		qry = qry + " 		, MEIN.MEIN_CODMEI MEINCODMEI "
		qry = qry + " 		, MEIN.MEIN_DESCRI MEINDESCRI "
		qry = qry + " 		, DET.MFDE_FECHA MOVIMFECHA "
		qry = qry + " 		, PARAM.FPAR_DESCRIPCION MOVIMDESCRI "
		qry = qry + "         , CASE DET.MFDE_TIPO_MOV "
		qry = qry + "             WHEN 115 THEN "
		qry = qry + "                 CASE "
		qry = qry + "                     WHEN DET.MFDE_IDTIPOMOTIVO = 0 THEN 'SIN DESCRIPCION' "
		qry = qry + "                     ELSE INITCAP((SELECT FPAR_DESCRIPCION FROM CLIN_FAR_PARAM WHERE FPAR_TIPO = 16 AND FPAR_CODIGO = DET.MFDE_IDTIPOMOTIVO)) "
		qry = qry + "                 END "
		qry = qry + "             WHEN 15 THEN "
		qry = qry + "                 CASE "
		qry = qry + "                     WHEN DET.MFDE_IDTIPOMOTIVO = 0 THEN 'SIN DESCRIPCION' "
		qry = qry + "                     ELSE INITCAP((SELECT FPAR_DESCRIPCION FROM CLIN_FAR_PARAM WHERE FPAR_TIPO = 16 AND FPAR_CODIGO = DET.MFDE_IDTIPOMOTIVO)) "
		qry = qry + "                 END "
		qry = qry + "             ELSE "
		qry = qry + "                 CASE "
		qry = qry + "                     WHEN DET.MFDE_IDTIPOMOTIVO = 0 THEN 'SIN DESCRIPCION' "
		qry = qry + "                     ELSE INITCAP((SELECT FPAR_DESCRIPCION FROM CLIN_FAR_PARAM WHERE FPAR_TIPO = 18 AND FPAR_CODIGO = DET.MFDE_IDTIPOMOTIVO)) "
		qry = qry + "                 END "
		qry = qry + "             END AS TIPOMOTIVODES "
		qry = qry + " 		, BODO.FBOD_DESCRIPCION FBODDESCRI "
		qry = qry + " 		, NVL(MOV.MOVF_RECE_ID, 0) AS NRORECETA "
		qry = qry + " 		, SOL.SOLI_NUMDOC_PROF RUTPROF "
		qry = qry + " 		, SOL.SOLI_NOM_MED_TRATANTE NOMBREPROF "
		qry = qry + " 		, (SELECT CLI.CLINUMIDENTIFICACION FROM CLIENTE CLI WHERE CLI.CLIID = SOL.SOLI_CLIID ) RUTPACIENTE "
		qry = qry + " 		, (SELECT CLI.CLINOMBRES || ' ' || CLI.CLIAPEPATERNO || ' ' || CLI.CLIAPEMATERNO FROM CLIENTE CLI WHERE CLI.CLIID = SOL.SOLI_CLIID ) NOMBREPACIENTE "
		qry = qry + " 		, CASE "
		qry = qry + "             WHEN DET.MFDE_TIPO_MOV IN (1,5,30,32,50,60,61,62,63,70,90,15,16,81,82,11,12,117,191,410,420,430) THEN DET.MFDE_CANTIDAD "
		qry = qry + " 			ELSE 0 END CANTIDADENTRADA "
		qry = qry + " 		, CASE "
		qry = qry + "             WHEN DET.MFDE_TIPO_MOV IN (17,75,80,83,84,85,100,105,108,115,116,140,150,160,170,180,190,201) THEN DET.MFDE_CANTIDAD "
		qry = qry + " 			ELSE  0 END CANTIDADSALIDA  "
		qry = qry + "         , 0 CANTIDADSALDO "
		qry = qry + "         , CASE "
		qry = qry + "             WHEN DET.MFDE_TIPO_MOV IN (1,5,50,60,61,62,63,70,75,81,83,85,90,100,108,140,150,160,190,191,201,410,420,430) THEN BODD.FBOD_CODIGO "
		qry = qry + " 			WHEN DET.MFDE_TIPO_MOV IN (11,12,15,16,17,30,32,80,82,84,105,115,116,117,170,180) THEN BODO.FBOD_CODIGO "
		qry = qry + " 			ELSE 0 END FBODSUMINISTRO "
		qry = qry + " 		, CASE "
		qry = qry + "             WHEN DET.MFDE_TIPO_MOV IN (1,5,12,30,32,80,82,85,170,180,201,410,420,430) THEN BODD.FBOD_DESCRIPCION "
		qry = qry + " 			WHEN DET.MFDE_TIPO_MOV IN (16,17,50,70,75,81,90,100,105,116,117) THEN BODO.FBOD_DESCRIPCION "
		qry = qry + " 			WHEN DET.MFDE_TIPO_MOV IN (11,15,60,61,62,63,83,84,108,115,140,150,160,190,191) THEN ' ' END FBODEXTERNADESC "
		qry = qry + " 		, NVL(SOL.SOLI_ID, 0) AS SOLIID "
		qry = qry + " 		, DET.MFDE_REFERENCIA_CONTABLE REFERENCIA "
		qry = qry + " 		, DET.MFDE_LOTE LOTE "
		qry = qry + " 		, DET.INT_ERP_ERROR INTERPERROR "
		qry = qry + " 	FROM "
		qry = qry + " 		  CLIN_FAR_MOVIM        MOV "
		qry = qry + " 		, CLIN_FAR_MOVIMDET     DET "
		qry = qry + " 		, CLIN_FAR_SOLICITUDES  SOL "
		qry = qry + " 		, CLIN_FAR_MAMEIN		MEIN "
		qry = qry + " 		, CLIN_FAR_PARAM		PARAM "
		qry = qry + " 		, CLIN_FAR_BODEGAS		BODO "
		qry = qry + " 		, CLIN_FAR_BODEGAS		BODD "
		qry = qry + " 	WHERE  "
		qry = qry + " 			MOV.MOVF_ID = DET.MFDE_MOVF_ID "
		qry = qry + " 		AND MOV.HDGCODIGO =  " + strconv.Itoa(res.PiHDGCodigo)
		qry = qry + " 		AND MOV.ESACODIGO =  " + strconv.Itoa(res.PiESACodigo)
		qry = qry + " 		AND MOV.CMECODIGO =  " + strconv.Itoa(res.PiCMECodigo)
		qry = qry + " 		AND MOV.MOVF_SOLI_ID = SOL.SOLI_ID (+) "
		qry = qry + " 		AND MEIN.MEIN_ID = DET.MFDE_MEIN_ID "
		qry = qry + " 		AND PARAM.FPAR_TIPO = 8 "
		qry = qry + " 		AND PARAM.FPAR_CODIGO = DET.MFDE_TIPO_MOV "
		qry = qry + " 		AND BODO.FBOD_CODIGO = MOV.MOVF_BOD_ORIGEN "
		qry = qry + " 		AND BODD.FBOD_CODIGO = MOV.MOVF_BOD_DESTINO "
		qry = qry + " 		AND DET.MFDE_MEIN_ID = " + strconv.Itoa(res.MeInID)
		qry = qry + "         AND DET.MFDE_TIPO_MOV NOT IN (102,610,620,630) "
		qry = qry + " 		AND DET.MFDE_FECHA BETWEEN ( "
		qry = qry + " 			SELECT  CKAR_FECHA_CIERRE "
		qry = qry + " 				FROM CLIN_FAR_CIERRE_KARDEX_PERIODO "
		qry = qry + " 				WHERE CKAR_ID = ( "
		qry = qry + " 					 SELECT MAX(CKAR_ID) "
		qry = qry + " 					FROM CLIN_FAR_CIERRE_KARDEX_PERIODO "
		qry = qry + " 					WHERE HDGCODIGO = MOV.HDGCODIGO "
		qry = qry + " 					AND CMECODIGO   = MOV.CMECODIGO "
		qry = qry + " 					AND FBOD_CODIGO = MOV.MOVF_BOD_ORIGEN) "
		qry = qry + " 			) AND SYSDATE "
		qry = qry + " 	UNION "
		qry = qry + " 	SELECT "
		qry = qry + " " + strconv.Itoa(res.KaDeID) + " KADEID "
		qry = qry + " 		, MOV.MOVF_BOD_ORIGEN CODBODEGA "
		qry = qry + " 		, MEIN.MEIN_ID MEINID "
		qry = qry + " 		, MEIN.MEIN_CODMEI MEINCODMEI "
		qry = qry + " 		, MEIN.MEIN_DESCRI MEINDESCRI "
		qry = qry + " 		, DEV.MDEV_FECHA MOVIMFECHA "
		qry = qry + " 		, PARAM.FPAR_DESCRIPCION MOVIMDESCRI "
		qry = qry + "         , CASE DET.MFDE_TIPO_MOV "
		qry = qry + "             WHEN 115 THEN "
		qry = qry + "                 CASE "
		qry = qry + "                     WHEN DET.MFDE_IDTIPOMOTIVO = 0 THEN 'SIN DESCRIPCION' "
		qry = qry + "                     ELSE INITCAP((SELECT FPAR_DESCRIPCION FROM CLIN_FAR_PARAM WHERE FPAR_TIPO = 16 AND FPAR_CODIGO = DET.MFDE_IDTIPOMOTIVO)) "
		qry = qry + "                 END "
		qry = qry + "             WHEN 15 THEN "
		qry = qry + "                 CASE "
		qry = qry + "                     WHEN DET.MFDE_IDTIPOMOTIVO = 0 THEN 'SIN DESCRIPCION' "
		qry = qry + "                     ELSE INITCAP((SELECT FPAR_DESCRIPCION FROM CLIN_FAR_PARAM WHERE FPAR_TIPO = 16 AND FPAR_CODIGO = DET.MFDE_IDTIPOMOTIVO)) "
		qry = qry + "                 END "
		qry = qry + "             ELSE "
		qry = qry + "                 CASE "
		qry = qry + "                     WHEN DET.MFDE_IDTIPOMOTIVO = 0 THEN 'SIN DESCRIPCION' "
		qry = qry + "                     ELSE INITCAP((SELECT FPAR_DESCRIPCION FROM CLIN_FAR_PARAM WHERE FPAR_TIPO = 18 AND FPAR_CODIGO = DET.MFDE_IDTIPOMOTIVO)) "
		qry = qry + "                 END "
		qry = qry + "             END AS TIPOMOTIVODES "
		qry = qry + " 		, BODO.FBOD_DESCRIPCION FBODDESCRI "
		qry = qry + " 		, NVL(MOV.MOVF_RECE_ID, 0) AS NRORECETA "
		qry = qry + " 		, SOL.SOLI_NUMDOC_PROF RUTPROF "
		qry = qry + " 		, SOL.SOLI_NOM_MED_TRATANTE NOMBREPROF "
		qry = qry + " 		, (SELECT CLI.CLINUMIDENTIFICACION FROM CLIENTE CLI WHERE CLI.CLIID = SOL.SOLI_CLIID ) RUTPACIENTE "
		qry = qry + " 		, (SELECT CLI.CLINOMBRES || ' ' || CLI.CLIAPEPATERNO || ' ' || CLI.CLIAPEMATERNO FROM CLIENTE CLI WHERE CLI.CLIID = SOL.SOLI_CLIID ) NOMBREPACIENTE "
		qry = qry + " 		, CASE "
		qry = qry + "             WHEN DEV.MDEV_MOVF_TIPO IN (1,5,30,32,50,60,61,62,63,70,90,15,16,81,82,11,12,117,191,410,420,430) THEN DEV.MDEV_CANTIDAD "
		qry = qry + " 			ELSE 0 END CANTIDADENTRADA "
		qry = qry + " 		, CASE "
		qry = qry + "             WHEN DEV.MDEV_MOVF_TIPO IN (17,75,80,83,84,85,100,105,108,115,116,140,150,160,170,180,190,201) THEN DEV.MDEV_CANTIDAD "
		qry = qry + " 			ELSE  0 END CANTIDADSALIDA "
		qry = qry + "         , 0 CANTIDADSALDO "
		qry = qry + "         , CASE "
		qry = qry + "             WHEN DEV.MDEV_MOVF_TIPO IN (1,5,50,60,61,62,63,70,75,81,83,85,90,100,108,140,150,160,190,191,201,410,420,430) THEN BODD.FBOD_CODIGO "
		qry = qry + " 			WHEN DEV.MDEV_MOVF_TIPO IN (11,12,15,16,17,30,32,80,82,84,105,115,116,117,170,180) THEN BODO.FBOD_CODIGO "
		qry = qry + " 			ELSE 0 END FBODSUMINISTRO "
		qry = qry + " 		, CASE "
		qry = qry + "             WHEN DEV.MDEV_MOVF_TIPO IN (1,5,12,30,32,80,82,85,170,180,201,410,420,430) THEN BODD.FBOD_DESCRIPCION "
		qry = qry + " 			WHEN DEV.MDEV_MOVF_TIPO IN (16,17,50,70,75,81,90,100,105,116,117) THEN BODO.FBOD_DESCRIPCION "
		qry = qry + " 			WHEN DEV.MDEV_MOVF_TIPO IN (11,15,60,61,62,63,83,84,108,115,140,150,160,190,191) THEN ' ' END FBODEXTERNADESC "
		qry = qry + " 		, NVL(SOL.SOLI_ID, 0) AS SOLIID "
		qry = qry + " 		, DEV.MDEV_REFERENCIA_CONTABLE REFERENCIA "
		qry = qry + " 		, DET.MFDE_LOTE LOTE "
		qry = qry + " 		, DEV.INT_ERP_ERROR INTERPERROR "
		qry = qry + " 	FROM "
		qry = qry + " 		  CLIN_FAR_MOVIM        MOV "
		qry = qry + " 		, CLIN_FAR_MOVIMDET     DET "
		qry = qry + " 		, CLIN_FAR_MOVIM_DEVOL  DEV "
		qry = qry + " 		, CLIN_FAR_SOLICITUDES  SOL "
		qry = qry + " 		, CLIN_FAR_MAMEIN		MEIN "
		qry = qry + " 		, CLIN_FAR_PARAM		PARAM "
		qry = qry + " 		, CLIN_FAR_BODEGAS		BODO "
		qry = qry + " 		, CLIN_FAR_BODEGAS		BODD "
		qry = qry + " 	WHERE "
		qry = qry + " 			MOV.MOVF_ID = DET.MFDE_MOVF_ID "
		qry = qry + " 		AND	DET.MFDE_ID = DEV.MDEV_MFDE_ID "
		qry = qry + " 		AND MOV.HDGCODIGO =  " + strconv.Itoa(res.PiHDGCodigo)
		qry = qry + " 		AND MOV.ESACODIGO =  " + strconv.Itoa(res.PiESACodigo)
		qry = qry + " 		AND MOV.CMECODIGO =  " + strconv.Itoa(res.PiCMECodigo)
		qry = qry + " 		AND MOV.MOVF_SOLI_ID = SOL.SOLI_ID (+) "
		qry = qry + " 		AND MEIN.MEIN_ID = DET.MFDE_MEIN_ID "
		qry = qry + " 		AND PARAM.FPAR_TIPO = 8 "
		qry = qry + " 		AND PARAM.FPAR_CODIGO = DET.MFDE_TIPO_MOV "
		qry = qry + " 		AND BODO.FBOD_CODIGO = MOV.MOVF_BOD_ORIGEN "
		qry = qry + " 		AND BODD.FBOD_CODIGO = MOV.MOVF_BOD_DESTINO "
		qry = qry + " 		AND DET.MFDE_MEIN_ID = " + strconv.Itoa(res.MeInID)
		qry = qry + " 		AND DEV.MDEV_FECHA BETWEEN ( "
		qry = qry + " 			SELECT  CKAR_FECHA_CIERRE "
		qry = qry + " 				FROM CLIN_FAR_CIERRE_KARDEX_PERIODO "
		qry = qry + " 				WHERE CKAR_ID = ( "
		qry = qry + " 					 SELECT MAX(CKAR_ID) "
		qry = qry + " 					FROM CLIN_FAR_CIERRE_KARDEX_PERIODO "
		qry = qry + " 					WHERE HDGCODIGO = MOV.HDGCODIGO "
		qry = qry + " 					AND CMECODIGO   = MOV.CMECODIGO "
		qry = qry + " 					AND FBOD_CODIGO = MOV.MOVF_BOD_ORIGEN) "
		qry = qry + " 			) AND SYSDATE "
		qry = qry + " ) WHERE FBODSUMINISTRO = " + strconv.Itoa(res.CodBodega)
		qry = qry + " ORDER BY MOVIMFECHA "
		//---------------------------------------------------------------------------------------------------------------------------------------
	}

	ctx := context.Background()
	rows, err := db.QueryContext(ctx, qry)

	logger.Trace(logs.InformacionLog{
		Query:   qry,
		Mensaje: "Query seleccionar cierre kardex prod bod",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   qry,
			Mensaje: "Se cayo query seleccionar cierre kardex prod bod",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()
	SALDO := 0
	retornoValores := []models.SelCierreKardexProdBod{}
	for rows.Next() {
		valores := models.SelCierreKardexProdBod{}

		err := rows.Scan(
			&valores.KaDeID,
			&valores.CodBodega,
			&valores.MeInID,
			&valores.MeInCodMeI,
			&valores.MeInDescri,
			&valores.MovimFecha,
			&valores.MovimDescri,
			&valores.TipoMotivoDes,
			&valores.FBodDescri,
			&valores.NroReceta,
			&valores.RutProf,
			&valores.NombreProf,
			&valores.RutPaciente,
			&valores.NombrePaciente,
			&valores.CantidadEntrada,
			&valores.CantidadSalida,
			&valores.CantidadSaldo,
			&valores.FBodSuministro,
			&valores.FBodExternaDesc,
			&valores.SoliId,
			&valores.Referencia,
			&valores.Lote,
			&valores.IntErpError,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan seleccionar cierre kardex prod bod",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		SALDO = SALDO + valores.CantidadEntrada - valores.CantidadSalida
		valores.CantidadSaldo = SALDO
		retornoValores = append(retornoValores, valores)
	}

	json.NewEncoder(w).Encode(retornoValores)
	models.EnableCors(&w)
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
