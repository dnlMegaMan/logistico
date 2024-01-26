package controller

import (
	"context"
	"encoding/json"
	ioutil "io"
	"net/http"
	"strconv"
	"strings"

	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"

	"sonda.com/logistico/Modulos/models"
)

// BuscarRecetasFichaMonitor is...
func BuscarRecetasFichaMonitor(w http.ResponseWriter, r *http.Request) {
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
	var msg models.Receta
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

	res := models.Receta{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.USUARIO)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	db, _ := database.GetConnection(res.SERVIDOR)

	var query string

	query = "select  clin_far_recetas.RECE_ID, clin_far_recetas.HDGCODIGO, clin_far_recetas.ESACODIGO, clin_far_recetas.CMECODIGO"
	query = query + " , clin_far_recetas.RECE_AMBITO, clin_far_recetas.RECE_TIPO, clin_far_recetas.RECE_NUMERO, clin_far_recetas.RECE_SUBRECETA"
	query = query + " , CASE WHEN clin_far_recetas.rece_subreceta > 1 THEN TO_CHAR(clin_far_recetas.rece_fecha_entrega, 'dd-mm-yyyy hh24:mi') || '(*)' ELSE TO_CHAR(clin_far_recetas.rece_fecha_entrega, 'dd-mm-yyyy hh24:mi') END "
	query = query + " , CASE WHEN clin_far_recetas.rece_subreceta > 1 THEN TO_CHAR(clin_far_recetas.rece_fecha_entrega, 'dd-mm-yyyy hh24:mi') || '(*)' ELSE TO_CHAR(clin_far_recetas.rece_fecha_entrega, 'dd-mm-yyyy hh24:mi') END "
	query = query + " , clin_far_recetas.RECE_FICHA_PACI"
	query = query + " , nvl(clin_far_recetas.RECE_CTAID, 0)"
	query = query + " , clin_far_recetas.RECE_URGID"
	query = query + " , clin_far_recetas.RECE_DAU"
	query = query + " , clin_far_recetas.RECE_CLIID"
	query = query + " , clin_far_recetas.RECE_TIPDOCPAC"
	query = query + " , clin_far_recetas.RECE_DOCUMPAC, clin_far_recetas.RECE_TIPDOCPROF, clin_far_recetas.RECE_DOCUMPROF, clin_far_recetas.RECE_ESPECIALIDAD"
	query = query + " , clin_far_recetas.RECE_ROLPROF, clin_far_recetas.RECE_SOL_ID, nvl(clin_far_recetas.RECE_ESTADO_DESPACHO, 0), clin_far_recetas.RECE_NOMBRE_PACIENTE"
	query = query + " , clin_far_recetas.RECE_NOMBRE_MEDICO "
	query = query + " , nvl((select cli.CLINOMBRES from cliente cli where cli.CODTIPIDENTIFICACION = RECE_TIPDOCPROF and cli.CLINUMIDENTIFICACION = RECE_DOCUMPROF), '') as ProfNombre"
	query = query + " , nvl((select cli.CLIAPEPATERNO from cliente cli where cli.CODTIPIDENTIFICACION = RECE_TIPDOCPROF and cli.CLINUMIDENTIFICACION = RECE_DOCUMPROF), '') as ProfPaterno"
	query = query + " , nvl((select cli.CLIAPEMATERNO from cliente cli where cli.CODTIPIDENTIFICACION = RECE_TIPDOCPROF and cli.CLINUMIDENTIFICACION = RECE_DOCUMPROF), '') as ProfMaterno"
	query = query + " , clin_far_recetas.RECE_COD_UNIDAD "
	query = query + " , clin_far_recetas.RECE_COD_SERVICIO "
	query = query + " , clin_far_recetas.RECE_GLOSA_UNIDAD"
	query = query + " , clin_far_recetas.RECE_GLOSA_SERVICIO"
	query = query + " , clin_far_recetas.RECE_CODIGO_CAMA"
	query = query + " , clin_far_recetas.RECE_GLOSA_CAMA"
	query = query + " , clin_far_recetas.RECE_CODIGO_PIEZA"
	query = query + " , clin_far_recetas.RECE_GLOSA_PIEZA"
	query = query + " , nvl((SELECT fpar_descripcion FROM clin_far_param WHERE fpar_tipo = 39 AND fpar_codigo = clin_far_recetas.RECE_TIPDOCPAC), ' ')RECE_TIPDOCPAC_GLOSA"
	query = query + " , cliente.CLINOMBRES"
	query = query + " , cliente.CLIAPEPATERNO"
	query = query + " , cliente.CLIAPEMATERNO"
	query = query + " , clin_far_recetas.CAJA_NUMERO_COMPROBANTE"
	query = query + " , clin_far_recetas.CAJA_ID_COMPROBANTE"
	query = query + " , nvl( to_char(clin_far_recetas.CAJA_FECHA_COMPROBANTE,'dd-mm-yyyy hh24:mi'), ' ' ) CAJA_FECHA_COMPROBANTE_CHAR"
	query = query + " , clin_far_recetas.CODIGO_ESTADO_COMPROBANTE"
	query = query + " , clin_far_recetas.GLOSA_ESTADO_COMPROBANTE"
	query = query + " , clin_far_recetas.CTANUMCUENTA"
	query = query + " from clin_far_recetas, cliente"
	query = query + " where 1 = 1 "
	query = query + " AND RECE_SUBRECETA <> 0 "
	query = query + " and RECE_ESTADO_RECETA = 'PE' "
	query = query + " and clin_far_recetas.RECE_CLIID = cliente.CLIID (+)"
	query = query + " and clin_far_recetas.HDGCODIGO = cliente.HDGCODIGO(+)"
	query = query + " and clin_far_recetas.CMECODIGO = cliente.CMECODIGO (+)"
	query = query + " AND (clin_far_recetas.RECE_CODBODEGA IN (SELECT FBOU_FBOD_CODIGO FROM clin_far_bodegas_usuario "
	query = query + " WHERE FBOU_FLD_USERID = (SELECT FLD_USERID FROM TBL_USER WHERE FLD_USERCODE = '" + res.USUARIO + "')) OR clin_far_recetas.RECE_CODBODEGA = 0)"
	if res.RECEID != 0 {
		query = query + " AND clin_far_recetas.RECE_ID = " + strconv.Itoa(res.RECEID)
	}
	if res.HDGCODIGO != 0 {
		query = query + " AND clin_far_recetas.HDGCODIGO = " + strconv.Itoa(res.HDGCODIGO)
	}
	if res.ESACODIGO != 0 {
		query = query + " AND clin_far_recetas.ESACODIGO = " + strconv.Itoa(res.ESACODIGO)
	}
	if res.CMECODIGO != 0 {
		query = query + " AND clin_far_recetas.CMECODIGO = " + strconv.Itoa(res.CMECODIGO)
	}
	if res.RECEAMBITO != 0 {
		query = query + " AND clin_far_recetas.RECE_AMBITO = " + strconv.Itoa(res.RECEAMBITO)
	}
	if res.RECENUMERO != 0 {
		query = query + " AND (clin_far_recetas.RECE_NUMERO = " + strconv.Itoa(res.RECENUMERO) + " or clin_far_recetas.rece_id = " + strconv.Itoa(res.RECENUMERO) + ") "
	}
	if res.FECHAINICIO != "" {
		query = query + " and clin_far_recetas.RECE_FECHA_ENTREGA between TO_DATE('" + res.FECHAINICIO + " 00:00:00','YYYY-MM-DD HH24:MI:SS') and TO_DATE ('" + res.FECHAHASTA + " 23:59:59' ,'YYYY-MM-DD HH24:MI:SS') "
	}
	if res.RECEESTADODESPACHO != 0 {
		query = query + " AND clin_far_recetas.RECE_ESTADO_DESPACHO = " + strconv.Itoa(res.RECEESTADODESPACHO)
	}
	if res.RECECODUNIDAD != "" {
		query = query + " AND clin_far_recetas.RECE_COD_UNIDAD = '" + res.RECECODUNIDAD + "'"
	}
	if res.RECECODSERVICIO != "" {
		query = query + " AND clin_far_recetas.RECE_COD_SERVICIO = '" + res.RECECODSERVICIO + "'"
	}
	if res.RECETIPDOCPAC != 0 {
		query = query + " AND clin_far_recetas.RECE_TIPDOCPAC = " + strconv.Itoa(res.RECETIPDOCPAC)
	}
	if res.RECEDOCUMPAC != "" {
		query = query + " AND clin_far_recetas.RECE_DOCUMPAC = '" + res.RECEDOCUMPAC + "'"
	}
	if res.CLINOMBRES != "" || res.CLIAPEPATERNO != "" || res.CLIAPEMATERNO != "" {
		nombre := ""
		if res.CLINOMBRES != "" {
			nombre = strings.ToUpper(res.CLINOMBRES)
		}
		if res.CLIAPEPATERNO != "" {
			nombre = nombre + " " + strings.ToUpper(res.CLIAPEPATERNO)
		}
		if res.CLIAPEMATERNO != "" {
			nombre = nombre + " " + strings.ToUpper(res.CLIAPEMATERNO)
		}
		query = query + " AND RECE_NOMBRE_PACIENTE LIKE ('%" + nombre + "%') "
	}
	query = query + " order by clin_far_recetas.RECE_ID DESC"

	ctx := context.Background()
	rows, err := db.QueryContext(ctx, query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query buscar recetas ficha monitor",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query buscar recetas ficha monitor",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	retornoValores := []models.Receta{}
	for rows.Next() {
		valores := models.Receta{}

		err := rows.Scan(
			&valores.RECEID,
			&valores.HDGCODIGO,
			&valores.ESACODIGO,
			&valores.CMECODIGO,
			&valores.RECEAMBITO,
			&valores.RECETIPO,
			&valores.RECENUMERO,
			&valores.RECESUBRECETA,
			&valores.RECEFECHA,
			&valores.RECEFECHAENTREGA,
			&valores.RECEFICHAPACI,
			&valores.RECECTAID,
			&valores.RECEURGID,
			&valores.RECEDAU,
			&valores.RECECLIID,
			&valores.RECETIPDOCPAC,
			&valores.RECEDOCUMPAC,
			&valores.RECETIPDOCPROF,
			&valores.RECEDOCUMPROF,
			&valores.RECEESPECIALIDAD,
			&valores.RECEROLPROF,
			&valores.RECESOLID,
			&valores.RECEESTADODESPACHO,
			&valores.RECENOMBREPACIENTE,
			&valores.RECENOMBREMEDICO,
			&valores.PROFNOMBRE,
			&valores.PROFAPEPATERNO,
			&valores.PROFAPEMATERNO,
			&valores.RECECODUNIDAD,
			&valores.RECECODSERVICIO,
			&valores.RECEGLOSAUNIDAD,
			&valores.RECEGLOSASERVICIO,
			&valores.RECECODIGOCAMA,
			&valores.RECEGLOSACAMA,
			&valores.RECECODIGOPIEZA,
			&valores.RECEGLOSAPIEZA,
			&valores.RECETIPDOCPACGLOSA,
			&valores.CLINOMBRES,
			&valores.CLIAPEPATERNO,
			&valores.CLIAPEMATERNO,
			&valores.CAJANUMEROCOMPROBANTE,
			&valores.CAJAIDCOMPROBANTE,
			&valores.CAJAFECHACOMPROBANTECHAR,
			&valores.CODIGOESTADOCOMPROBANTE,
			&valores.GLOSAESTADOCOMPROBANTE,
			&valores.CTANUMCUENTA,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan buscar recetas ficha monitor",
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
