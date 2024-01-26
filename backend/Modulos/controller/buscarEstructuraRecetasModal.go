package controller

import (
	"context"
	"encoding/json"
	"io/ioutil"
	"net/http"
	"strconv"
	"strings"

	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"

	"sonda.com/logistico/Modulos/models"
)

// BuscarEstructuraRecetasModal is...
func BuscarEstructuraRecetasModal(w http.ResponseWriter, r *http.Request) {
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

	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	db, _ := database.GetConnection(res.SERVIDOR)

	var query string

	query = "select  clin_far_RECEtas.RECE_ID "
	query = query + " ,clin_far_RECEtas.HDGCODIGO "
	query = query + " ,clin_far_RECEtas.ESACODIGO "
	query = query + " ,clin_far_RECEtas.CMECODIGO "
	query = query + " ,clin_far_RECEtas.RECE_AMBITO "
	query = query + " ,clin_far_RECEtas.RECE_TIPO "
	query = query + " ,nvl(clin_far_RECEtas.RECE_NUMERO , 0) as numero_RECEta "
	query = query + " ,clin_far_RECEtas.RECE_SUBRECETA "
	query = query + " ,to_char(clin_far_RECEtas.RECE_FECHA,'dd-mm-yyyy hh24:mi') "
	query = query + " ,to_char(clin_far_RECEtas.RECE_FECHA_ENTREGA,'dd-mm-yyyy hh24:mi')"
	query = query + " ,clin_far_RECEtas.RECE_FICHA_PACI "
	query = query + " ,clin_far_RECEtas.RECE_CTAID "
	query = query + " ,clin_far_RECEtas.RECE_URGID "
	query = query + " ,clin_far_RECEtas.RECE_DAU "
	query = query + " ,clin_far_RECEtas.RECE_CLIID"
	query = query + " ,clin_far_RECEtas.RECE_TIPDOCPAC "
	query = query + " ,clin_far_RECEtas.RECE_DOCUMPAC, clin_far_RECEtas.RECE_TIPDOCPROF, clin_far_RECEtas.RECE_DOCUMPROF, clin_far_RECEtas.RECE_ESPECIALIDAD"
	query = query + " ,clin_far_RECEtas.RECE_ROLPROF, clin_far_RECEtas.RECE_SOL_ID, nvl(clin_far_RECEtas.RECE_ESTADO_DESPACHO, 0), clin_far_RECEtas.RECE_NOMBRE_PACIENTE"
	query = query + " ,clin_far_RECEtas.RECE_NOMBRE_MEDICO, TRIM(clin_far_RECEtas.RECE_COD_UNIDAD), TRIM(clin_far_RECEtas.RECE_COD_SERVICIO) "
	query = query + " , nvl((select UNDGLOSA from unidad where HDGCODIGO = clin_far_RECEtas.hdgcodigo AND codunidad = trim(clin_far_RECEtas.RECE_cod_unidad)), ' ') as undglosa "
	query = query + " ,nvl((select SERV_DESCRIPCION from clin_servicios_logistico where trim(SERV_CODIGO) = trim(clin_far_RECEtas.RECE_COD_SERVICIO) AND hdgcodigo = clin_far_RECEtas.hdgcodigo AND esacodigo = clin_far_RECEtas.esacodigo AND cmecodigo = clin_far_RECEtas.cmecodigo) , ' ') as SERV_DESCRIPCION"
	query = query + " ,TRIM(clin_far_RECEtas.RECE_CODIGO_CAMA)"
	query = query + " ,clin_far_RECEtas.RECE_GLOSA_CAMA"
	query = query + " ,TRIM(clin_far_RECEtas.RECE_CODIGO_PIEZA)"
	query = query + " ,clin_far_RECEtas.RECE_GLOSA_PIEZA"
	query = query + " ,nvl((SELECT fpar_descripcion FROM clin_far_param WHERE fpar_tipo = 39 AND fpar_codigo = clin_far_RECEtas.RECE_TIPDOCPAC), ' ')RECE_TIPDOCPAC_GLOSA"
	query = query + " ,(select cli.clinombres from cliente cli where cliid = RECE_CLIID) "
	query = query + " ,(select cli.cliapepaterno from cliente cli where cliid = RECE_CLIID) "
	query = query + " ,(select cli.cliapematerno from cliente cli where cliid = RECE_CLIID) "
	query = query + " ,clin_far_RECEtas.CAJA_NUMERO_COMPROBANTE"
	query = query + " ,clin_far_RECEtas.CAJA_ID_COMPROBANTE"
	query = query + " ,nvl( to_char(clin_far_RECEtas.CAJA_FECHA_COMPROBANTE,'dd-mm-yyyy hh24:mi'), ' ' ) CAJA_FECHA_COMPROBANTE_CHAR"
	query = query + " ,clin_far_RECEtas.CODIGO_ESTADO_COMPROBANTE"
	query = query + " ,clin_far_RECEtas.GLOSA_ESTADO_COMPROBANTE"
	query = query + " ,nvl( (select cuenta.PESTID from cuenta where cuenta.CTAID = clin_far_RECEtas.RECE_CTAID  AND  rownum =1), 0 )  PESTID"
	query = query + " ,clin_far_RECEtas.CTANUMCUENTA"
	query = query + " ,clin_far_RECEtas.RECE_OBSERVACION"
	query = query + " ,calcularedad(TO_CHAR((select cli.clifecnacimiento from cliente cli where cliid = RECE_CLIID), 'yyyy/mm/dd'), TO_CHAR(SYSDATE, 'yyyy/mm/dd')) edad "
	query = query + " ,nvl((select glssexo from prmsexo where codsexo = cliente.codsexo), ' ' ) as sexo "
	query = query + " ,nvl((select CLINOMBRES    from cliente where CODTIPIDENTIFICACION = RECE_TIPDOCPROF AND trim(clinumidentificacion) = trim(RECE_DOCUMPROF)), ' ' ) as nombreprof "
	query = query + " ,nvl((select CLIAPEPATERNO from cliente where CODTIPIDENTIFICACION = RECE_TIPDOCPROF AND trim(clinumidentificacion) = trim(RECE_DOCUMPROF)), ' ' ) as apepaternoprof "
	query = query + " ,nvl((select CLIAPEMATERNO from cliente where CODTIPIDENTIFICACION = RECE_TIPDOCPROF AND trim(clinumidentificacion) = trim(RECE_DOCUMPROF)), ' ' ) as apematernoprof "
	query = query + " ,clin_far_RECEtas.RECE_BANDERA"
	query = query + " ,clin_far_RECEtas.RECE_COD_COBRO_INCLUIDO"
	query = query + " ,nvl((select fpar_descripcion from clin_far_param WHERE fpar_tipo = 105 AND fpar_codigo = clin_far_RECEtas.RECE_COD_COBRO_INCLUIDO), ' ' ) as GlosaCobro"
	query = query + " ,nvl(clin_far_RECEtas.RECE_CODBODEGA, 0) as CODBODEGA"
	query = query + " ,clin_far_RECEtas.RECE_ESTADO_RECETA"
	query = query + " from clin_far_RECEtas, cliente"
	query = query + " where 1=1 "
	query = query + " AND clin_far_RECEtas.RECE_CLIID = cliente.CLIID (+)"
	// query = query + " AND clin_far_RECEtas.HDGCODIGO = cliente.HDGCODIGO(+)"
	// query = query + " AND clin_far_RECEtas.CMECODIGO = cliente.CMECODIGO (+)"
	if res.RECEID != 0 {
		query = query + " AND (clin_far_RECEtas.RECE_ID = " + strconv.Itoa(res.RECEID)
		query = query + " OR clin_far_RECEtas.rece_numero = " + strconv.Itoa(res.RECEID) + ")"
	}
	if res.HDGCODIGO != 0 {
		query = query + " AND clin_far_RECEtas.HDGCODIGO = " + strconv.Itoa(res.HDGCODIGO)
	}
	if res.ESACODIGO != 0 {
		query = query + " AND clin_far_RECEtas.ESACODIGO = " + strconv.Itoa(res.ESACODIGO)
	}
	if res.CMECODIGO != 0 {
		query = query + " AND clin_far_RECEtas.CMECODIGO = " + strconv.Itoa(res.CMECODIGO)
	}
	if res.RECEAMBITO != 0 {
		query = query + " AND clin_far_RECEtas.RECE_AMBITO = " + strconv.Itoa(res.RECEAMBITO)
	}
	if res.RECENUMERO != 0 {
		query = query + " AND (clin_far_RECEtas.RECE_ID = " + strconv.Itoa(res.RECENUMERO)
		query = query + " OR clin_far_RECEtas.rece_numero = " + strconv.Itoa(res.RECENUMERO) + ")"
	}
	if res.FECHAINICIO != "" {
		query = query + " AND clin_far_RECEtas.RECE_FECHA_ENTREGA between TO_DATE('" + res.FECHAINICIO + " 00:00:00','YYYY-MM-DD HH24:MI:SS') AND TO_DATE ('" + res.FECHAHASTA + " 23:59:59' ,'YYYY-MM-DD HH24:MI:SS') "
	}
	if res.RECEESTADODESPACHO != 0 {
		query = query + " AND clin_far_RECEtas.RECE_ESTADO_DESPACHO = " + strconv.Itoa(res.RECEESTADODESPACHO)
	}
	if res.RECECODUNIDAD != "" {
		query = query + " AND clin_far_RECEtas.RECE_COD_UNIDAD = '" + res.RECECODUNIDAD + "'"
	}
	if res.RECECODSERVICIO != "" {
		query = query + " AND clin_far_RECEtas.RECE_COD_SERVICIO = '" + res.RECECODSERVICIO + "'"
	}
	if res.RECECLIID != 0 {
		query = query + " AND clin_far_RECEtas.RECE_CLIID = " + strconv.Itoa(res.RECECLIID)
	}
	query = query + " order by clin_far_RECEtas.RECE_ID DESC"

	ctx := context.Background()
	rows, err := db.QueryContext(ctx, query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query buscar estructura recetas modal",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query buscar estructura recetas modal",
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
			&valores.PESTID,
			&valores.CTANUMCUENTA,
			&valores.RECEOBSERVACION,
			&valores.EDAD,
			&valores.SEXO,
			&valores.PROFNOMBRE,
			&valores.PROFAPEPATERNO,
			&valores.PROFAPEMATERNO,
			&valores.BANDERA,
			&valores.CODCOBROINCLUIDO,
			&valores.GLOSACOBRO,
			&valores.CODBODEGA,
			&valores.RECEESTADORECETA,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan buscar estructura recetas modal",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		// DETALLE RECETA
		query = "select REDE_ID, RECE_ID, REDE_MEIN_CODMEI, REDE_MEIN_DESCRI, REDE_DOSIS, REDE_VECES, REDE_TIEMPO"
		query = query + " ,REDE_GLOSAPOSOLOGIA, REDE_CANTIDAD_SOLI, REDE_CANTIDAD_ADESP "
		query = query + " ,MEIN_ID, MEIN_TIPOREG, MEIN_CONTROLADO, CANTIDAD_PAGADA_CAJA"
		query = query + " from clin_far_RECEtasdet, clin_far_mamein"
		query = query + " where rede_estado_producto <> 'ELIMINADO'"
		query = query + " AND clin_far_RECEtasdet.RECE_ID = " + strconv.Itoa(valores.RECEID)
		query = query + " AND clin_far_RECEtasdet.HDGCODIGO = " + strconv.Itoa(valores.HDGCODIGO)
		query = query + " AND clin_far_RECEtasdet.ESACODIGO = " + strconv.Itoa(valores.ESACODIGO)
		query = query + " AND clin_far_RECEtasdet.CMECODIGO = " + strconv.Itoa(valores.CMECODIGO)
		query = query + " AND clin_far_RECEtasdet.REDE_MEIN_CODMEI = clin_far_mamein.MEIN_CODMEI(+)"
		query = query + " AND clin_far_mamein.hdgcodigo(+)  = " + strconv.Itoa(valores.HDGCODIGO)

		ctx = context.Background()
		rowsDetalle, err := db.QueryContext(ctx, query)

		logger.Trace(logs.InformacionLog{
			Query:   query,
			Mensaje: "Query detalle receta",
		})

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:    query,
				Mensaje:  "Se cayo query detalle receta",
				Error:    err,
				Contexto: map[string]interface{}{"idReceta": valores.RECEID},
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rowsDetalle.Close()

		for rowsDetalle.Next() {
			valoresdetalle := models.RecetaDetalle{}

			err := rowsDetalle.Scan(
				&valoresdetalle.REDEID,
				&valoresdetalle.RECEID,
				&valoresdetalle.REDEMEINCODMEI,
				&valoresdetalle.REDEMEINDESCRI,
				&valoresdetalle.REDEDOSIS,
				&valoresdetalle.REDEVECES,
				&valoresdetalle.REDETIEMPO,
				&valoresdetalle.REDEGLOSAPOSOLOGIA,
				&valoresdetalle.REDECANTIDADSOLI,
				&valoresdetalle.REDECANTIDADADESP,
				&valoresdetalle.MEINID,
				&valoresdetalle.MEINTIPOREG,
				&valoresdetalle.MEINCONTROLADO,
				&valoresdetalle.CANTIDADPAGADACAJA,
			)

			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje:  "Se cayo scan detalle receta",
					Error:    err,
					Contexto: map[string]interface{}{"idReceta": valores.RECEID},
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			valores.RECETADETALLE = append(valores.RECETADETALLE, valoresdetalle)
		}

		retornoValores = append(retornoValores, valores)
	}

	query = "SELECT DISTINCT"
	query = query + "  TO_CHAR(RECE.RECE_FECHA, 'DD/MM/YYYY') as FECHADIG "
	query = query + " ,NVL((SELECT CASE FPAR_CODIGO WHEN 1 THEN 'A' WHEN 2 THEN 'U' WHEN 3 THEN 'H' END FROM CLIN_FAR_PARAM WHERE FPAR_TIPO = 36 AND FPAR_CODIGO = RECE.RECE_AMBITO), ' ') AS AMB "
	query = query + " ,RECE.RECE_ID            as RECETA "
	query = query + " ,RECE.RECE_NUMERO        as RECENUMERO "
	query = query + " ,RECE.RECE_TIPO          as TIPO "
	query = query + " ,TO_CHAR(RECE.RECE_FECHA_ENTREGA, 'DD/MM/YYYY') as TRPRFENTREGA "
	query = query + " ,REDE.REDE_MEIN_CODMEI   as CODIGO "
	query = query + " ,REDE.REDE_MEIN_DESCRI   as DESCRIPCION "
	query = query + " ,REDE.REDE_CANTIDAD_SOLI as SOL "
	query = query + " ,NVL((SELECT SUM(SODE_CANT_DESP) FROM CLIN_FAR_SOLICITUDES, CLIN_FAR_SOLICITUDES_DET WHERE SOLI_ID=SODE_SOLI_ID AND SOLI_NUMERO_RECETA = RECE.RECE_NUMERO AND SOLI_ESTADO <> 80 AND REDE.REDE_MEIN_CODMEI = SODE_MEIN_CODMEI),0)     as DESP "
	query = query + " ,(REDE.REDE_CANTIDAD_SOLI - NVL((SELECT SUM(SODE_CANT_DESP) FROM CLIN_FAR_SOLICITUDES, CLIN_FAR_SOLICITUDES_DET WHERE SOLI_ID=SODE_SOLI_ID AND SOLI_ESTADO <> 80 AND SOLI_NUMERO_RECETA = RECE.RECE_NUMERO AND REDE.REDE_MEIN_CODMEI = SODE_MEIN_CODMEI),0)) as PEND "
	// query = query + " ,SODE.SODE_CANT_DESP     as DESP "
	// query = query + " ,( REDE.REDE_CANTIDAD_SOLI - SODE.SODE_CANT_DESP ) as PEND "
	query = query + "FROM "
	query = query + "   CLIN_FAR_RECETAS           RECE "
	query = query + "  ,CLIN_FAR_RECETASDET        REDE "
	// query = query + "  ,CLIN_FAR_SOLICITUDES       SOLI "
	query = query + "  ,CLIN_FAR_SOLICITUDES_DET   SODE "
	query = query + " WHERE "
	query = query + "      RECE.RECE_ID = REDE.RECE_ID "
	// query = query + "  AND RECE.RECE_SOL_ID = SOLI.SOLI_ID(+) "
	// query = query + "  AND SODE.SODE_SOLI_ID = SOLI.SOLI_ID(+) "
	// query = query + "  AND rede.REDE_MEIN_CODMEI = sode.SODE_MEIN_CODMEI "
	query = query + " AND SODE.HDGCODIGO(+) =" + strconv.Itoa(res.HDGCODIGO) + " "
	query = query + " AND SODE.ESACODIGO(+) =" + strconv.Itoa(res.ESACODIGO) + " "
	query = query + " AND SODE.CMECODIGO(+) =" + strconv.Itoa(res.CMECODIGO) + " "

	if res.RECECLIID > 0 {
		query = query + "  AND RECE.RECE_CLIID = " + strconv.Itoa(res.RECECLIID)
	}
	if res.RECETIPO != "" {
		query = query + "  AND RECE.RECE_TIPO = '" + res.RECETIPO + "'"
	}
	if res.RECEAMBITO > 0 {
		query = query + "  AND RECE.RECE_AMBITO = " + strconv.Itoa(res.RECEAMBITO)
	}
	query = query + "  AND ( RECE.RECE_FECHA_ENTREGA between to_date('" + res.FECHAINICIO + " 00:00:00','YYYY-MM-DD HH24:MI:SS') and TO_DATE ('" + res.FECHAHASTA + " 23:59:59', 'YYYY-MM-DD HH24:MI:SS') or "
	query = query + "  RECE.RECE_FECHA between to_date('" + res.FECHAINICIO + " 00:00:00','YYYY-MM-DD HH24:MI:SS') and TO_DATE ('" + res.FECHAHASTA + " 23:59:59', 'YYYY-MM-DD HH24:MI:SS')) "
	query = query + "  order by RECE.RECE_id desc "

	ctx = context.Background()
	rowsDetalle, err := db.QueryContext(ctx, query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query detalle receta modal",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query detalle receta modal",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rowsDetalle.Close()

	for rowsDetalle.Next() {
		DetalleModal := models.RecetaDetalleModal{}

		err := rowsDetalle.Scan(
			&DetalleModal.FechaDig,
			&DetalleModal.Ambito,
			&DetalleModal.Receta,
			&DetalleModal.ReceNumero,
			&DetalleModal.Tipo,
			&DetalleModal.TrPrFEntrega,
			&DetalleModal.Codigo,
			&DetalleModal.Descripcion,
			&DetalleModal.Solicitado,
			&DetalleModal.Despachado,
			&DetalleModal.Pendiente,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan  detalle receta modal",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		retornoValores[0].RECETADETALLEMODAL = append(retornoValores[0].RECETADETALLEMODAL, DetalleModal)
	}

	json.NewEncoder(w).Encode(retornoValores)
	models.EnableCors(&w)
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
