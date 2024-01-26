package controller

import (
	"context"
	"database/sql"
	"database/sql/driver"
	"encoding/json"
	"fmt"
	ioutil "io"
	"net/http"
	"strconv"
	"strings"

	logs "sonda.com/logistico/logging"

	. "github.com/godror/godror"
	database "sonda.com/logistico/pkg_conexion"

	"sonda.com/logistico/Modulos/models"

	param "sonda.com/logistico/Modulos/comun"
)

// BuscarEstructuraRecetas is...
func BuscarEstructuraRecetas(w http.ResponseWriter, r *http.Request) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	var retornoValores []models.Receta
	var valores models.Receta

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

	query = "select  clin_far_recetas.RECE_ID, clin_far_recetas.HDGCODIGO, clin_far_recetas.ESACODIGO, clin_far_recetas.CMECODIGO"
	query = query + " ,clin_far_recetas.RECE_AMBITO, clin_far_recetas.RECE_TIPO, "
	query = query + " nvl(clin_far_recetas.RECE_NUMERO , 0) as numero_receta, "
	query = query + " clin_far_recetas.RECE_SUBRECETA"
	query = query + "  ,to_char(clin_far_recetas.RECE_FECHA,'dd-mm-yyyy hh24:mi'), "
	query = query + " to_char(clin_far_recetas.RECE_FECHA_ENTREGA,'dd-mm-yyyy hh24:mi')"
	query = query + " ,clin_far_recetas.RECE_FICHA_PACI"
	query = query + " ,clin_far_recetas.RECE_CTAID"
	query = query + " ,clin_far_recetas.RECE_URGID"
	query = query + " ,clin_far_recetas.RECE_DAU"
	query = query + " ,clin_far_recetas.RECE_CLIID"
	query = query + " ,clin_far_recetas.RECE_TIPDOCPAC"
	query = query + " ,clin_far_recetas.RECE_DOCUMPAC, clin_far_recetas.RECE_TIPDOCPROF, clin_far_recetas.RECE_DOCUMPROF, clin_far_recetas.RECE_ESPECIALIDAD"
	query = query + " ,clin_far_recetas.RECE_ROLPROF, clin_far_recetas.RECE_SOL_ID, nvl(clin_far_recetas.RECE_ESTADO_DESPACHO, 0), clin_far_recetas.RECE_NOMBRE_PACIENTE"
	query = query + " ,clin_far_recetas.RECE_NOMBRE_MEDICO, TRIM(clin_far_recetas.RECE_COD_UNIDAD), TRIM(clin_far_recetas.RECE_COD_SERVICIO) "
	query = query + " , nvl((select UNDGLOSA from unidad where codunidad = trim(clin_far_recetas.rece_cod_unidad) AND hdgcodigo=clin_far_recetas.hdgcodigo), ' ') as undglosa "
	// query = query + " ,nvl((select SERV_DESCRIPCION from clin_servicios_logistico where (SERV_CODIGO) = (clin_far_recetas.RECE_COD_SERVICIO) and hdgcodigo = clin_far_recetas.hdgcodigo and esacodigo = clin_far_recetas.esacodigo and cmecodigo = clin_far_recetas.cmecodigo) , ' ') as SERV_DESCRIPCION"
	query = query + " ,NVL((SELECT SERGLOSA FROM SERVICIO WHERE HDGCODIGO = clin_far_recetas.hdgcodigo AND CODSERVICIO = TRIM(clin_far_recetas.rece_cod_servicio)), ' ') AS serv_descripcion "
	query = query + " ,TRIM(clin_far_recetas.RECE_CODIGO_CAMA)"
	query = query + " ,clin_far_recetas.RECE_GLOSA_CAMA"
	query = query + " ,TRIM(clin_far_recetas.RECE_CODIGO_PIEZA)"
	query = query + " ,clin_far_recetas.RECE_GLOSA_PIEZA"
	query = query + " ,nvl((SELECT fpar_descripcion FROM clin_far_param WHERE fpar_tipo = 39 AND fpar_codigo = clin_far_recetas.RECE_TIPDOCPAC), ' ')RECE_TIPDOCPAC_GLOSA"
	query = query + " ,cliente.CLINOMBRES"
	query = query + " ,cliente.CLIAPEPATERNO"
	query = query + " ,cliente.CLIAPEMATERNO"
	query = query + " ,clin_far_recetas.CAJA_NUMERO_COMPROBANTE"
	query = query + " ,clin_far_recetas.CAJA_ID_COMPROBANTE"
	query = query + " ,nvl( to_char(clin_far_recetas.CAJA_FECHA_COMPROBANTE,'dd-mm-yyyy hh24:mi'), ' ' ) CAJA_FECHA_COMPROBANTE_CHAR"
	query = query + " ,clin_far_recetas.CODIGO_ESTADO_COMPROBANTE"
	query = query + " ,clin_far_recetas.GLOSA_ESTADO_COMPROBANTE"
	query = query + " ,nvl( (select cuenta.PESTID from cuenta where cuenta.CTAID = clin_far_recetas.RECE_CTAID  and  rownum =1), 0 )  PESTID"
	query = query + " ,clin_far_recetas.CTANUMCUENTA"
	query = query + " ,clin_far_recetas.RECE_OBSERVACION"
	query = query + " ,calcularedad(to_char(cliente.clifecnacimiento,'yyyy/mm/dd'), to_char(sysdate,'yyyy/mm/dd')) edad "
	query = query + " ,nvl((select glssexo from prmsexo where codsexo = cliente.codsexo), ' ' ) as sexo "
	query = query + " ,nvl((select CLINOMBRES    from cliente where CODTIPIDENTIFICACION = RECE_TIPDOCPROF AND (clinumidentificacion) = (RECE_DOCUMPROF)), ' ' ) as nombreprof "
	query = query + " ,nvl((select CLIAPEPATERNO from cliente where CODTIPIDENTIFICACION = RECE_TIPDOCPROF AND (clinumidentificacion) = (RECE_DOCUMPROF)), ' ' ) as apepaternoprof "
	query = query + " ,nvl((select CLIAPEMATERNO from cliente where CODTIPIDENTIFICACION = RECE_TIPDOCPROF AND (clinumidentificacion) = (RECE_DOCUMPROF)), ' ' ) as apematernoprof "
	query = query + " ,clin_far_recetas.RECE_BANDERA"
	query = query + " ,clin_far_recetas.RECE_COD_COBRO_INCLUIDO"
	query = query + " ,nvl((select fpar_descripcion from clin_far_param WHERE fpar_tipo = 105 and fpar_codigo = clin_far_recetas.RECE_COD_COBRO_INCLUIDO), ' ' ) as GlosaCobro"
	query = query + " ,nvl(clin_far_recetas.RECE_CODBODEGA, 0) as CODBODEGA"
	query = query + " ,clin_far_recetas.RECE_ESTADO_RECETA"
	// query = query + ", NVL((select max(CODIGOPLANCOTIZANTE) from PLANPACIENTERSC WHERE CLIID = cliente.CLIID), ' ') as PlanCotizante "
	// query = query + ", nvl((select nvl(max(PACPJEBONIFCOTIZANTE), 0) || ' %' from PLANPACIENTERSC WHERE CLIID = cliente.CLIID), '0 %') as Bonificacion "

	query = query + ",nvl( "
	query = query + "	(CASE  RECE_AMBITO "
	query = query + "	WHEN 1 THEN (Select CODIGOPLANCOTIZANTE from PLANPACIENTERSC where IDPERSONARED =  (Select CLI.IDFEDERADOR from cliente CLI where CLI.CLIID = rece_cliid)) "
	query = query + "	ELSE (SELECT MAX(PL.codigoplancotizante) FROM cuentaplanpacrsc PL WHERE PL.PCLIID = rece_cliid) END) "
	query = query + "	, ' ') AS PlanCotizante "
	query = query + ",to_char(nvl( "
	query = query + "	(CASE  RECE_AMBITO "
	query = query + "	WHEN 1 THEN (Select pacpjebonifcotizante from PLANPACIENTERSC where IDPERSONARED =  (Select CLI.IDFEDERADOR from cliente CLI where CLI.CLIID = rece_cliid)) "
	query = query + "	ELSE (SELECT MAX(PL.pacpjebonifcotizante)  FROM cuentaplanpacrsc PL WHERE PL.PCLIID = rece_cliid) END) "
	query = query + "	, 0) || ' %') Bonificacion "

	query = query + " from clin_far_recetas, cliente"
	query = query + " where 1=1 "
	query = query + " and clin_far_recetas.RECE_CLIID = cliente.CLIID (+)"
	// query = query + " and clin_far_recetas.HDGCODIGO = cliente.HDGCODIGO(+)"
	// query = query + " and clin_far_recetas.CMECODIGO = cliente.CMECODIGO (+)"

	if res.RECEID != 0 {
		query = query + " AND clin_far_RECEtas.rece_id = " + strconv.Itoa(res.RECEID)
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
		query = query + " AND clin_far_RECEtas.rece_numero = " + strconv.Itoa(res.RECENUMERO)
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
	query = query + " order by clin_far_recetas.RECE_ID DESC"

	var RECEID int
	var HDGCODIGO int
	var ESACODIGO int
	var CMECODIGO int
	var RECEAMBITO int
	var RECETIPO string
	var RECENUMERO int
	var RECESUBRECETA int
	var RECEFECHA string
	var RECEFECHAENTREGA string
	var RECEFICHAPACI int
	var RECECTAID int
	var RECEURGID int
	var RECEDAU int
	var RECECLIID int
	var RECETIPDOCPAC int
	var RECEDOCUMPAC string
	var RECETIPDOCPROF int
	var RECEDOCUMPROF string
	var RECEESPECIALIDAD string
	var RECEROLPROF string
	var RECESOLID int
	var RECEESTADODESPACHO int
	var RECENOMBREPACIENTE string
	var RECENOMBREMEDICO string
	var RECECODUNIDAD string
	var RECECODSERVICIO string
	var RECEGLOSAUNIDAD string
	var RECEGLOSASERVICIO string
	var RECECODIGOCAMA string
	var RECEGLOSACAMA string
	var RECECODIGOPIEZA string
	var RECEGLOSAPIEZA string
	var RECETIPDOCPACGLOSA string
	var CLINOMBRES string
	var CLIAPEPATERNO string
	var CLIAPEMATERNO string
	var CAJANUMEROCOMPROBANTE int
	var CAJAIDCOMPROBANTE int
	var CAJAFECHACOMPROBANTECHAR string
	var CODIGOESTADOCOMPROBANTE string
	var GLOSAESTADOCOMPROBANTE string
	var RECEOBSERVACION string
	var PESTID int
	var CTANUMCUENTA int
	var EDAD string
	var SEXO string
	var PROFNOMBRE string
	var PROFAPEPATERNO string
	var PROFAPEMATERNO string
	var BANDERA int
	var CODCOBROINCLUIDO int
	var GLOSACOBRO string
	var CODBODEGA int
	var RECEESTADORECETA string
	var PlanCotizante string
	var Bonificacion string

	var REDEID int
	//var RECEID int
	var REDEMEINCODMEI string
	var REDEMEINDESCRI string
	var REDEDOSIS int
	var REDEVECES int
	var REDETIEMPO int
	var REDEGLOSAPOSOLOGIA string
	var REDECANTIDADSOLI int
	var REDECANTIDADADESP int

	var MEINID int
	var MEINTIPOREG string
	var MEINCONTROLADO string

	var CANTIDADPAGADACAJA int

	var retornodetalle []models.RecetaDetalle
	var valoresdetalle models.RecetaDetalle

	ctx := context.Background()

	///buscar valor del FLAG en BD
	valor, err := param.ObtenerClinFarParamGeneral(db, "usaPCKBusEstRec")
	if err != nil {
		http.Error(w, "Error interno del servidor", http.StatusInternalServerError)
		logger.Error(logs.InformacionLog{
			Mensaje: "Error al obtener el valor del parámetro",
			Error:   err,
		})
		return
	}

	if valor == "SI" {
		var rows driver.Rows
		logger.Info(logs.InformacionLog{Query: "Entro en la solución [buscarEstructuraRecetas.go] por package PKG_BUSCAR_ESTRUCTURA_RECETAS.P_BUSCAR_ESTRUCTURA_RECETAS", Mensaje: "Entro en la solución BuscarEstructuraRecetas [BuscarEstructuraRecetas.go] por package PKG_BUSCAR_ESTRUCTURA_RECETAS.P_BUSCAR_ESTRUCTURA_RECETAS"})
		transaccion, err := db.Begin()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "No puede crear transacción para devolver busqueda estructura recetas",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		logger.Info(logs.InformacionLog{Mensaje: "Datos de entrada PKG: " +
			"RECEID: " + strconv.Itoa(res.RECEID) + " " +
			"HDGCODIGO: " + strconv.Itoa(res.HDGCODIGO) + " " +
			"ESACODIGO: " + strconv.Itoa(res.ESACODIGO) + " " +
			"CMECODIGO: " + strconv.Itoa(res.CMECODIGO) + " " +
			"RECEAMBITO: " + strconv.Itoa(res.RECEAMBITO) + " " +
			"RECENUMERO: " + strconv.Itoa(res.RECENUMERO) + " " +
			"FECHAINICIO: " + res.FECHAINICIO + " " +
			"FECHAHASTA: " + res.FECHAHASTA + " " +
			"RECEESTADODESPACHO: " + strconv.Itoa(res.RECEESTADODESPACHO) + " " +
			"RECECODUNIDAD: " + res.RECECODUNIDAD + " " +
			"RECECODSERVICIO: " + res.RECECODSERVICIO})

		qry := "BEGIN PKG_BUSCAR_ESTRUCTURA_RECETAS.P_BUSCAR_ESTRUCTURA_RECETAS(:1,:2,:3,:4,:5,:6,:7,:8,:9,:10,:11,:12); END;"
		_, err = transaccion.Exec(qry,
			PlSQLArrays,
			res.RECEID,             // :1
			res.HDGCODIGO,          // :2
			res.ESACODIGO,          // :3
			res.CMECODIGO,          // :4
			res.RECEAMBITO,         // :5
			res.RECENUMERO,         // :6
			res.FECHAINICIO,        // :7
			res.FECHAHASTA,         // :8
			res.RECEESTADODESPACHO, // :9
			res.RECECODUNIDAD,      // :10
			res.RECECODSERVICIO,    // :11
			sql.Out{Dest: &rows})   // :12
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Fallo package al buscar estructura recetas",
				Error:   err,
			})
			err = transaccion.Rollback()
		}
		logger.Info(logs.InformacionLog{Query: qry, Mensaje: "Ejecución Package BuscarEstructuraRecetas"})
		fmt.Println(rows)
		defer rows.Close()
		sub, err := WrapRows(ctx, db, rows)
		if err != nil {
			fmt.Println(err.Error())
		}
		defer sub.Close()
		fmt.Println("Sub", sub)
		for sub.Next() {
			err := sub.Scan(&RECEID, &HDGCODIGO, &ESACODIGO, &CMECODIGO, &RECEAMBITO, &RECETIPO,
				&RECENUMERO, &RECESUBRECETA, &RECEFECHA, &RECEFECHAENTREGA, &RECEFICHAPACI,
				&RECECTAID, &RECEURGID, &RECEDAU, &RECECLIID, &RECETIPDOCPAC, &RECEDOCUMPAC,
				&RECETIPDOCPROF, &RECEDOCUMPROF, &RECEESPECIALIDAD, &RECEROLPROF, &RECESOLID,
				&RECEESTADODESPACHO, &RECENOMBREPACIENTE, &RECENOMBREMEDICO, &RECECODUNIDAD,
				&RECECODSERVICIO, &RECEGLOSAUNIDAD, &RECEGLOSASERVICIO, &RECECODIGOCAMA, &RECEGLOSACAMA,
				&RECECODIGOPIEZA, &RECEGLOSAPIEZA, &RECETIPDOCPACGLOSA, &CLINOMBRES, &CLIAPEPATERNO,
				&CLIAPEMATERNO, &CAJANUMEROCOMPROBANTE, &CAJAIDCOMPROBANTE, &CAJAFECHACOMPROBANTECHAR,
				&CODIGOESTADOCOMPROBANTE, &GLOSAESTADOCOMPROBANTE, &PESTID, &CTANUMCUENTA, &RECEOBSERVACION,
				&EDAD, &SEXO, &PROFNOMBRE, &PROFAPEPATERNO, &PROFAPEMATERNO, &BANDERA, &CODCOBROINCLUIDO,
				&GLOSACOBRO, &CODBODEGA, &RECEESTADORECETA, &PlanCotizante, &Bonificacion)
			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo scan busca estructura recetas",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			valores.RECEID = RECEID
			valores.HDGCODIGO = HDGCODIGO
			valores.ESACODIGO = ESACODIGO
			valores.CMECODIGO = CMECODIGO
			valores.RECEAMBITO = RECEAMBITO
			valores.RECETIPO = RECETIPO
			valores.RECENUMERO = RECENUMERO
			valores.RECESUBRECETA = RECESUBRECETA
			valores.RECEFECHA = RECEFECHA
			valores.RECEFECHAENTREGA = RECEFECHAENTREGA
			valores.RECEFICHAPACI = RECEFICHAPACI
			valores.RECECTAID = RECECTAID
			valores.RECEURGID = RECEURGID
			valores.RECEDAU = RECEDAU
			valores.RECECLIID = RECECLIID
			valores.RECETIPDOCPAC = RECETIPDOCPAC
			valores.RECEDOCUMPAC = RECEDOCUMPAC
			valores.RECETIPDOCPROF = RECETIPDOCPROF
			valores.RECEDOCUMPROF = RECEDOCUMPROF
			valores.RECEESPECIALIDAD = RECEESPECIALIDAD
			valores.RECEROLPROF = RECEROLPROF
			valores.RECESOLID = RECESOLID
			valores.RECEESTADODESPACHO = RECEESTADODESPACHO
			valores.RECENOMBREPACIENTE = RECENOMBREPACIENTE
			valores.RECENOMBREMEDICO = RECENOMBREMEDICO
			valores.RECECODUNIDAD = RECECODUNIDAD
			valores.RECECODSERVICIO = RECECODSERVICIO
			valores.RECEGLOSAUNIDAD = RECEGLOSAUNIDAD
			valores.RECEGLOSASERVICIO = RECEGLOSASERVICIO
			valores.RECECODIGOCAMA = RECECODIGOCAMA
			valores.RECEGLOSACAMA = RECEGLOSACAMA
			valores.RECECODIGOPIEZA = RECECODIGOPIEZA
			valores.RECEGLOSAPIEZA = RECEGLOSAPIEZA
			valores.RECETIPDOCPACGLOSA = RECETIPDOCPACGLOSA
			valores.CLINOMBRES = CLINOMBRES
			valores.CLIAPEPATERNO = CLIAPEPATERNO
			valores.CLIAPEMATERNO = CLIAPEMATERNO
			valores.CAJANUMEROCOMPROBANTE = CAJANUMEROCOMPROBANTE
			valores.CAJAIDCOMPROBANTE = CAJAIDCOMPROBANTE
			valores.CAJAFECHACOMPROBANTECHAR = CAJAFECHACOMPROBANTECHAR
			valores.CODIGOESTADOCOMPROBANTE = CODIGOESTADOCOMPROBANTE
			valores.GLOSAESTADOCOMPROBANTE = GLOSAESTADOCOMPROBANTE
			valores.PESTID = PESTID
			valores.CTANUMCUENTA = CTANUMCUENTA
			valores.RECEOBSERVACION = RECEOBSERVACION
			valores.SEXO = SEXO
			valores.EDAD = EDAD
			valores.PROFNOMBRE = PROFNOMBRE
			valores.PROFAPEPATERNO = PROFAPEPATERNO
			valores.PROFAPEMATERNO = PROFAPEMATERNO
			valores.CODCOBROINCLUIDO = CODCOBROINCLUIDO
			valores.GLOSACOBRO = GLOSACOBRO
			valores.BANDERA = BANDERA
			valores.CODBODEGA = CODBODEGA
			valores.RECEESTADORECETA = RECEESTADORECETA
			valores.PlanCotizante = PlanCotizante
			valores.Bonificacion = Bonificacion
		}

	} else {
		ctx := context.Background()

		rows, err := db.QueryContext(ctx, query)

		logger.Trace(logs.InformacionLog{Query: query, Mensaje: "[buscarEstructuraRecetas.go] Query buscar estructura receta"})

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   query,
				Mensaje: "Se cayo query buscar estructura receta",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		for rows.Next() {
			err := rows.Scan(&RECEID, &HDGCODIGO, &ESACODIGO, &CMECODIGO, &RECEAMBITO, &RECETIPO,
				&RECENUMERO, &RECESUBRECETA, &RECEFECHA, &RECEFECHAENTREGA, &RECEFICHAPACI,
				&RECECTAID, &RECEURGID, &RECEDAU, &RECECLIID, &RECETIPDOCPAC, &RECEDOCUMPAC,
				&RECETIPDOCPROF, &RECEDOCUMPROF, &RECEESPECIALIDAD, &RECEROLPROF, &RECESOLID,
				&RECEESTADODESPACHO, &RECENOMBREPACIENTE, &RECENOMBREMEDICO, &RECECODUNIDAD,
				&RECECODSERVICIO, &RECEGLOSAUNIDAD, &RECEGLOSASERVICIO, &RECECODIGOCAMA, &RECEGLOSACAMA,
				&RECECODIGOPIEZA, &RECEGLOSAPIEZA, &RECETIPDOCPACGLOSA, &CLINOMBRES, &CLIAPEPATERNO,
				&CLIAPEMATERNO, &CAJANUMEROCOMPROBANTE, &CAJAIDCOMPROBANTE, &CAJAFECHACOMPROBANTECHAR,
				&CODIGOESTADOCOMPROBANTE, &GLOSAESTADOCOMPROBANTE, &PESTID, &CTANUMCUENTA, &RECEOBSERVACION,
				&EDAD, &SEXO, &PROFNOMBRE, &PROFAPEPATERNO, &PROFAPEMATERNO, &BANDERA, &CODCOBROINCLUIDO,
				&GLOSACOBRO, &CODBODEGA, &RECEESTADORECETA, &PlanCotizante, &Bonificacion)
			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo scan buscar estructura receta",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			valores.RECEID = RECEID
			valores.HDGCODIGO = HDGCODIGO
			valores.ESACODIGO = ESACODIGO
			valores.CMECODIGO = CMECODIGO
			valores.RECEAMBITO = RECEAMBITO
			valores.RECETIPO = RECETIPO
			valores.RECENUMERO = RECENUMERO
			valores.RECESUBRECETA = RECESUBRECETA
			valores.RECEFECHA = RECEFECHA
			valores.RECEFECHAENTREGA = RECEFECHAENTREGA
			valores.RECEFICHAPACI = RECEFICHAPACI
			valores.RECECTAID = RECECTAID
			valores.RECEURGID = RECEURGID
			valores.RECEDAU = RECEDAU
			valores.RECECLIID = RECECLIID
			valores.RECETIPDOCPAC = RECETIPDOCPAC
			valores.RECEDOCUMPAC = RECEDOCUMPAC
			valores.RECETIPDOCPROF = RECETIPDOCPROF
			valores.RECEDOCUMPROF = RECEDOCUMPROF
			valores.RECEESPECIALIDAD = RECEESPECIALIDAD
			valores.RECEROLPROF = RECEROLPROF
			valores.RECESOLID = RECESOLID
			valores.RECEESTADODESPACHO = RECEESTADODESPACHO
			valores.RECENOMBREPACIENTE = RECENOMBREPACIENTE
			valores.RECENOMBREMEDICO = RECENOMBREMEDICO
			valores.RECECODUNIDAD = RECECODUNIDAD
			valores.RECECODSERVICIO = RECECODSERVICIO
			valores.RECEGLOSAUNIDAD = RECEGLOSAUNIDAD
			valores.RECEGLOSASERVICIO = RECEGLOSASERVICIO
			valores.RECECODIGOCAMA = RECECODIGOCAMA
			valores.RECEGLOSACAMA = RECEGLOSACAMA
			valores.RECECODIGOPIEZA = RECECODIGOPIEZA
			valores.RECEGLOSAPIEZA = RECEGLOSAPIEZA
			valores.RECETIPDOCPACGLOSA = RECETIPDOCPACGLOSA
			valores.CLINOMBRES = CLINOMBRES
			valores.CLIAPEPATERNO = CLIAPEPATERNO
			valores.CLIAPEMATERNO = CLIAPEMATERNO
			valores.CAJANUMEROCOMPROBANTE = CAJANUMEROCOMPROBANTE
			valores.CAJAIDCOMPROBANTE = CAJAIDCOMPROBANTE
			valores.CAJAFECHACOMPROBANTECHAR = CAJAFECHACOMPROBANTECHAR
			valores.CODIGOESTADOCOMPROBANTE = CODIGOESTADOCOMPROBANTE
			valores.GLOSAESTADOCOMPROBANTE = GLOSAESTADOCOMPROBANTE
			valores.PESTID = PESTID
			valores.CTANUMCUENTA = CTANUMCUENTA
			valores.RECEOBSERVACION = RECEOBSERVACION
			valores.SEXO = SEXO
			valores.EDAD = EDAD
			valores.PROFNOMBRE = PROFNOMBRE
			valores.PROFAPEPATERNO = PROFAPEPATERNO
			valores.PROFAPEMATERNO = PROFAPEMATERNO
			valores.CODCOBROINCLUIDO = CODCOBROINCLUIDO
			valores.GLOSACOBRO = GLOSACOBRO
			valores.BANDERA = BANDERA
			valores.CODBODEGA = CODBODEGA
			valores.RECEESTADORECETA = RECEESTADORECETA
			valores.PlanCotizante = PlanCotizante
			valores.Bonificacion = Bonificacion
		}

	}
	// DETALLE RECETA
	query = "select REDE_ID, RECE_ID, REDE_MEIN_CODMEI, REDE_MEIN_DESCRI, REDE_DOSIS, REDE_VECES, REDE_TIEMPO"
	query = query + " ,REDE_GLOSAPOSOLOGIA, REDE_CANTIDAD_SOLI, REDE_CANTIDAD_ADESP "
	query = query + " ,MEIN_ID, MEIN_TIPOREG, MEIN_CONTROLADO, CANTIDAD_PAGADA_CAJA"
	query = query + " from clin_far_recetasdet, clin_far_mamein"
	query = query + " where rede_estado_producto <> 'ELIMINADO'"
	query = query + " and clin_far_recetasdet.RECE_ID = " + strconv.Itoa(valores.RECEID)
	query = query + " and clin_far_recetasdet.REDE_MEIN_CODMEI = clin_far_mamein.MEIN_CODMEI(+)"
	query = query + " AND clin_far_recetasdet.HDGCODIGO = " + strconv.Itoa(valores.HDGCODIGO)
	query = query + " AND clin_far_recetasdet.ESACODIGO = " + strconv.Itoa(valores.ESACODIGO)
	query = query + " AND clin_far_recetasdet.CMECODIGO = " + strconv.Itoa(valores.CMECODIGO)
	query = query + " and clin_far_mamein.hdgcodigo  = " + strconv.Itoa(valores.HDGCODIGO)

	ctx = context.Background()

	rowsDetalle, err := db.QueryContext(ctx, query)

	logger.Trace(logs.InformacionLog{Query: query, Mensaje: fmt.Sprintf("Query detalle recetas para receta %d", valores.RECEID)})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: fmt.Sprintf("[buscarEstructuraRecetas.go] Se cayo query detalle recetas para receta %d", valores.RECEID),
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rowsDetalle.Close()

	for rowsDetalle.Next() {
		err := rowsDetalle.Scan(&REDEID, &RECEID, &REDEMEINCODMEI, &REDEMEINDESCRI, &REDEDOSIS, &REDEVECES, &REDETIEMPO, &REDEGLOSAPOSOLOGIA, &REDECANTIDADSOLI, &REDECANTIDADADESP, &MEINID, &MEINTIPOREG, &MEINCONTROLADO, &CANTIDADPAGADACAJA)
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: fmt.Sprintf("Se cayo scan detalle recetas para receta %d", valores.RECEID),
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		valoresdetalle.REDEID = REDEID
		valoresdetalle.RECEID = RECEID
		valoresdetalle.REDEMEINCODMEI = REDEMEINCODMEI
		valoresdetalle.REDEMEINDESCRI = REDEMEINDESCRI
		valoresdetalle.REDEDOSIS = REDEDOSIS
		valoresdetalle.REDEVECES = REDEVECES
		valoresdetalle.REDETIEMPO = REDETIEMPO
		valoresdetalle.REDEGLOSAPOSOLOGIA = REDEGLOSAPOSOLOGIA
		valoresdetalle.REDECANTIDADSOLI = REDECANTIDADSOLI
		valoresdetalle.REDECANTIDADADESP = REDECANTIDADADESP
		valoresdetalle.MEINID = MEINID
		valoresdetalle.MEINTIPOREG = MEINTIPOREG
		valoresdetalle.MEINCONTROLADO = MEINCONTROLADO
		valoresdetalle.CANTIDADPAGADACAJA = CANTIDADPAGADACAJA

		retornodetalle = append(retornodetalle, valoresdetalle)
	}

	valores.RECETADETALLE = retornodetalle

	retornoValores = append(retornoValores, valores)

	json.NewEncoder(w).Encode(retornoValores)
	models.EnableCors(&w)
	w.Header().Set("Content-Type", "application/json")

	//jsonSalida, _ := json.Marshal(retornoValores)
	//log.Println("*************************************jsonSalida (buscarestructurarecetas): ", string(jsonSalida))

	logger.LoguearSalida()
}
