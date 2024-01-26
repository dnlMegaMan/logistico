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

// SelCierreLibroMedControlados is...
func SelCierreLibroMedControlados(w http.ResponseWriter, r *http.Request) {
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
	var msg models.PSelCierreLibroMedControlados
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

	res := models.PSelCierreLibroMedControlados{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.PiUsuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	db, _ := database.GetConnection(res.PiServidor)

	var qry string
	if res.LibCID > 0 {
		qry = "SELECT "
		qry = qry + "   " + strconv.Itoa(res.LibCID) + " AS LIBCID "
		qry = qry + " , LIDE_CORRE_CODMEI AS CORRELATIVO "
		qry = qry + " , (SELECT SOLI_BOD_ORIGEN FROM CLIN_FAR_SOLICITUDES WHERE SOLI_ID = LIDE_MOVF_SOLI_ID) AS CODBODEGACONTROLADOS "
		qry = qry + " , (SELECT MEIN_ID FROM CLIN_FAR_MAMEIN WHERE MEIN_CODMEI = LIDE_MEIN_CODMEI) AS MEINID "
		qry = qry + " , LIDE_MEIN_CODMEI AS MEINCODMEI "
		qry = qry + " , (SELECT TRIM(MEIN_DESCRI) FROM CLIN_FAR_MAMEIN WHERE MEIN_CODMEI=LIDE_MEIN_CODMEI) AS MEINDESCRI "
		qry = qry + " , LIDE_FECHA AS MOVIMFECHA "
		qry = qry + " , (SELECT TRIM(FPAR_DESCRIPCION) FROM CLIN_FAR_PARAM WHERE FPAR_TIPO = LIDE_FPAR_TIPO AND FPAR_CODIGO=LIDE_TIPO_MOV) AS MOVIMDESCRI "
		qry = qry + " , ' ' AS TIPOMOTIVODES "
		qry = qry + " , (SELECT FBOD_DESCRIPCION FROM CLIN_FAR_BODEGAS WHERE FBOD_CODIGO = (SELECT SOLI_BOD_ORIGEN FROM CLIN_FAR_SOLICITUDES WHERE SOLI_ID = LIDE_MOVF_SOLI_ID)) AS FBOBDESCRI "
		qry = qry + " , LIDE_MOVF_RECETA AS NRORECETA "
		qry = qry + " , LIDE_MOVF_SOLI_ID AS NROSOLICITUD "
		qry = qry + " , LIDE_CLINUMIDENTIFICACION_PROF AS RUTPROF "
		qry = qry + " , (SELECT TRIM(CLINOMBRES)||' '||TRIM(CLIAPEPATERNO)||' '||TRIM(CLIAPEMATERNO) FROM DESA1.CLIENTE WHERE CODTIPIDENTIFICACION=LIDE_CODTIPIDENTIFICACION_PROF AND TRIM(CLINUMIDENTIFICACION)=TRIM(LIDE_CLINUMIDENTIFICACION_PROF) ) AS NOMBREPROF "
		qry = qry + " , LIDE_CLINUMIDENTIFICACION AS RUTPACIENTE "
		qry = qry + " , (SELECT TRIM(CLINOMBRES)||' '||TRIM(CLIAPEPATERNO)||' '||TRIM(CLIAPEMATERNO) FROM DESA1.CLIENTE WHERE CODTIPIDENTIFICACION=LIDE_CODTIPIDENTIFICACION AND TRIM(CLINUMIDENTIFICACION)=TRIM(LIDE_CLINUMIDENTIFICACION) ) AS NOMBREPACIENTE "
		qry = qry + " , DECODE (LIDE_OPERACION,'S',LIDE_CANTIDAD,0) AS CANTIDADENTRADA "
		qry = qry + " , DECODE (LIDE_OPERACION,'R',LIDE_CANTIDAD,0) AS CANTIDADSALIDA "
		qry = qry + " , LIDE_STOCK_SALDO AS CANTIDADSALDO "
		qry = qry + " FROM CLIN_FAR_LIBRO_CONT_DETA "
		qry = qry + " WHERE LIDE_MEIN_CODMEI = (SELECT MEIN_CODMEI FROM CLIN_FAR_MAMEIN WHERE MEIN_ID = " + strconv.Itoa(res.MeInID) + ") "
		qry = qry + " AND LIDE_HDGCODIGO= " + strconv.Itoa(res.PiHDGCodigo)
		qry = qry + " AND LIDE_ESACODIGO= " + strconv.Itoa(res.PiESACodigo)
		qry = qry + " AND LIDE_CMECODIGO= " + strconv.Itoa(res.PiCMECodigo)
		qry = qry + " ORDER BY LIDE_MEIN_CODMEI, LIDE_CORRE_CODMEI "
	} else {
		// //-- -- Realizo el mismo proceso de cierre pero hasta este momento (Periodo Actual)
		// var intIDReport int64
		// // Obtiene el IdReport
		// intIDReport = ObtieneidReport(res.PiServidor)
		// //llamo a pkg para carga de tabla temporal con proceso de cierre
		// qry = " BEGIN"
		// qry = qry + " PKG_PROCESA_MOVIMIENTOS_ART_CONTROLADO.PROCESA_MOVIMIENTOS_ART_CONTROLADO("
		// qry = qry + " " + strconv.FormatInt(intIDReport, 10)
		// qry = qry + " ," + strconv.Itoa(res.PiHDGCodigo)
		// qry = qry + " ," + strconv.Itoa(res.PiESACodigo)
		// qry = qry + " ," + strconv.Itoa(res.PiCMECodigo)
		// qry = qry + " , '" + res.PiUsuario + "'"
		// qry = qry + " ," + strconv.Itoa(res.LibCID)
		// qry = qry + " ," + strconv.Itoa(res.CodBodegaControlados)
		// qry = qry + " ," + strconv.Itoa(res.MeInID)
		// qry = qry + " );"
		// qry = qry + " END;"

		// log.Println("*************************************** (selcierrelibromedcontrolados), qry:  ", qry)

		// ctx := context.Background()
		// resinsmovim, err := db.QueryContext(ctx, qry)
		// if err != nil {
		// 	//defer db.Close()
		// 	log.Println("************************************** ERROR (selcierrekardexprodbod), qry:  ", qry)
		// 	log.Println(err, resinsmovim)
		// 	http.Error(w, err.Error(), 500)
		// }
		// defer resinsmovim.Close()
		// //defer db.Close()

		//consulta sobre tabla temporal de proceso de cierre periodo actual
		qry = "SELECT "
		qry = qry + "   " + strconv.Itoa(res.LibCID) + " AS LIBCID "
		qry = qry + " , LIDE_CORRE_CODMEI AS CORRELATIVO "
		qry = qry + " , NVL((SELECT SOLI_BOD_ORIGEN FROM CLIN_FAR_SOLICITUDES WHERE SOLI_ID = LIDE_MOVF_SOLI_ID ), 0) AS CODBODEGACONTROLADOS "
		qry = qry + " , (SELECT MEIN_ID FROM CLIN_FAR_MAMEIN WHERE MEIN_CODMEI = LIDE_MEIN_CODMEI) AS MEINID "
		qry = qry + " , LIDE_MEIN_CODMEI AS MEINCODMEI "
		qry = qry + " , (SELECT TRIM(MEIN_DESCRI) FROM CLIN_FAR_MAMEIN WHERE MEIN_CODMEI=LIDE_MEIN_CODMEI) AS MEINDESCRI "
		qry = qry + " , LIDE_FECHA AS MOVIMFECHA "
		qry = qry + " , (SELECT TRIM(FPAR_DESCRIPCION) FROM CLIN_FAR_PARAM WHERE FPAR_TIPO = LIDE_FPAR_TIPO AND FPAR_CODIGO=LIDE_TIPO_MOV) AS MOVIMDESCRI "
		qry = qry + " , ' ' AS TIPOMOTIVODES "
		qry = qry + " , NVL((SELECT FBOD_DESCRIPCION FROM CLIN_FAR_BODEGAS WHERE FBOD_CODIGO = (SELECT SOLI_BOD_ORIGEN FROM CLIN_FAR_SOLICITUDES WHERE SOLI_ID = LIDE_MOVF_SOLI_ID ) ), ' ') AS FBOBDESCRI "
		qry = qry + " , NVL(LIDE_MOVF_RECETA, 0) AS NRORECETA "
		qry = qry + " , NVL(LIDE_MOVF_SOLI_ID, 0) AS NROSOLICITUD "
		qry = qry + " , LIDE_CLINUMIDENTIFICACION_PROF AS RUTPROF "
		qry = qry + " , (Select trim(CliNombres)||' '||Trim(CliApepaterno)||' '||Trim(CliApematerno) from desa1.cliente where CODTIPIDENTIFICACION=LIDE_CODTIPIDENTIFICACION_PROF And CliNumIdentificacion=rpad(upper(LIDE_CLINUMIDENTIFICACION_PROF),20) ) NOMBREPROF "
		qry = qry + " , LIDE_CLINUMIDENTIFICACION AS RUTPACIENTE "
		qry = qry + " , (Select trim(CliNombres)||' '||Trim(CliApepaterno)||' '||Trim(CliApematerno) from desa1.cliente where CODTIPIDENTIFICACION=LIDE_CODTIPIDENTIFICACION And CliNumIdentificacion=rpad(upper(LIDE_CLINUMIDENTIFICACION),20) ) AS NOMBREPACIENTE "
		qry = qry + " , DECODE (LIDE_OPERACION,'S',LIDE_CANTIDAD,0) AS CANTIDADENTRADA "
		qry = qry + " , DECODE (LIDE_OPERACION,'R',LIDE_CANTIDAD,0) AS CANTIDADSALIDA "
		qry = qry + " , LIDE_STOCK_SALDO AS CANTIDADSALDO "
		qry = qry + " , NVL(LIDE_REFERENCIA_CONTABLE,0) AS REFERENCIA "
		qry = qry + " FROM CLIN_FAR_LIBRO_CONT_DETA "
		qry = qry + " WHERE LIDE_MEIN_ID = " + strconv.Itoa(res.MeInID)
		qry = qry + " AND LIDE_HDGCODIGO= " + strconv.Itoa(res.PiHDGCodigo)
		qry = qry + " AND LIDE_ESACODIGO= " + strconv.Itoa(res.PiESACodigo)
		qry = qry + " AND LIDE_CMECODIGO= " + strconv.Itoa(res.PiCMECodigo)
		qry = qry + " ORDER BY LIDE_CORRE_CODMEI "
		//---------------------------------------------------------------------------------------------------------------------------------------
	}

	ctx := context.Background()
	rows, err := db.QueryContext(ctx, qry)

	logger.Trace(logs.InformacionLog{
		Query:   qry,
		Mensaje: "Query seleccionar cioerre libro medicamentos controlados",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   qry,
			Mensaje: "Se cayo query seleccionar cioerre libro medicamentos controlados",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	retornoValores := []models.SelCierreLibroMedControlados{}
	for rows.Next() {
		valores := models.SelCierreLibroMedControlados{}

		err := rows.Scan(
			&valores.LIBCID,
			&valores.CORRELATIVO,
			&valores.CODBODEGACONTROLADOS,
			&valores.MEINID,
			&valores.MEINCODMEI,
			&valores.MEINDESCRI,
			&valores.MOVIMFECHA,
			&valores.MOVIMDESCRI,
			&valores.TIPOMOTIVODES,
			&valores.FBOBDESCRI,
			&valores.NRORECETA,
			&valores.NROSOLICITUD,
			&valores.RUTPROF,
			&valores.NOMBREPROF,
			&valores.RUTPACIENTE,
			&valores.NOMBREPACIENTE,
			&valores.CANTIDADENTRADA,
			&valores.CANTIDADSALIDA,
			&valores.CANTIDADSALDO,
			&valores.REFERENCIA,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan seleccionar cioerre libro medicamentos controlados",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		retornoValores = append(retornoValores, valores)
	}

	json.NewEncoder(w).Encode(retornoValores)
	models.EnableCors(&w)
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
