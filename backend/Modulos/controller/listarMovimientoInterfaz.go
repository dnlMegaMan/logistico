package controller

import (
	"context"
	"database/sql"
	"database/sql/driver"
	"encoding/json"
	ioutil "io"
	"net/http"
	"strconv"
	"strings"

	. "github.com/godror/godror"
	"sonda.com/logistico/Modulos/models"
	logs "sonda.com/logistico/logging"

	. "sonda.com/logistico/Modulos/comun"
	database "sonda.com/logistico/pkg_conexion"
)

// ListarMovimientoInterfaz is...
func ListarMovimientoInterfaz(w http.ResponseWriter, r *http.Request) {
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
	var msg models.MoviminetoInterfaz

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

	res := models.MoviminetoInterfaz{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.USUARIO)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	models.EnableCors(&w)

	db, _ := database.GetConnection(res.SERVIDOR)
	retornoValores := []models.MoviminetoInterfaz{}
	ctx := context.Background()
	valor, err := ObtenerClinFarParamGeneral(db, "usaPCKListMovInt")
	if err != nil {
		http.Error(w, "Error interno del servidor", http.StatusInternalServerError)
		logger.Error(logs.InformacionLog{
			Mensaje: "Error al obtener el valor del parámetro",
			Error:   err,
		})
		return
	}

	if valor == "SI" {
		var rowPKG driver.Rows
		logger.Trace(logs.InformacionLog{Mensaje: "Entro en la solución LISTAR MOVIMIENTO INTERFAZ"})
		jsonEntrada, _ := json.Marshal(res)
		In_Json := string(jsonEntrada)
		logger.Trace(logs.InformacionLog{JSONEntrada: In_Json, Mensaje: "JSON In_Json"})
		QUERY := "BEGIN PKG_LISTAR_MOVIMIENTO_INTERFAZ.P_LISTAR_MOVIMIENTO_INTERFAZ(:1,:2); end;"
		transaccion, err := db.Begin()
		logger.Trace(logs.InformacionLog{Query: QUERY, Mensaje: "Ejecución Package LISTAR MOVIMIENTO INTERFAZ"})
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "No puede crear transacción para devolver LISTAR MOVIMIENTO INTERFAZ",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		_, err = transaccion.Exec(QUERY,
			PlSQLArrays,
			In_Json,                // :1
			sql.Out{Dest: &rowPKG}) // :2
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo package LISTAR MOVIMIENTO INTERFAZ",
				Error:   err,
			})
			err = transaccion.Rollback()
		}
		defer rowPKG.Close()
		rows, err := WrapRows(ctx, db, rowPKG)
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo wrap rows",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		for rows.Next() {
			valores := models.MoviminetoInterfaz{
				MARCA:     false,
				HDGCODIGO: res.HDGCODIGO,
				ESACODIGO: res.ESACODIGO,
				CMECODIGO: res.CMECODIGO,
			}

			err := rows.Scan(
				&valores.MOVID,
				&valores.DETID,
				&valores.DEVID,
				&valores.SOLIID,
				&valores.IDAGRUPADOR,
				&valores.FDEID,
				&valores.FECHA,
				&valores.TIPOMOVIMIENTOCUENTA,
				&valores.CODTIPMOV,
				&valores.TIPOMOVIMIENTO,
				&valores.IDENTIFICACION,
				&valores.PACIENTE,
				&valores.MFDEMEINCODMEI,
				&valores.MFDEMEINID,
				&valores.MFDECANTIDAD,
				&valores.MFDECTASID,
				&valores.MFDEREFERENCIACONTABLE,
				&valores.INTCARGOESTADO,
				&valores.INTCARGOFECHA,
				&valores.INTCARGOERROR,
				&valores.INTERPESTADO,
				&valores.INTERPFECHA,
				&valores.INTERPERROR,
				&valores.DESCRIPCIONPRODUCTO,
				&valores.CAMAACTUAL,
				&valores.SERVICIO,
				&valores.CODAMBITO,
				&valores.CTANUMCUENTA,
				&valores.NUMERORECETA,
			)

			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo scan listar movimientos interfaz",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			retornoValores = append(retornoValores, valores)
		}

		logger.Trace(logs.InformacionLog{
			Mensaje:  "Commit exitoso LISTAR MOVIMIENTO INTERFAZ",
			Contexto: map[string]interface{}{"Out_Json": retornoValores},
		})
	} else {
		query := "SELECT MOV_ID, DET_ID, DEV_ID, SOLI_ID,AGRUPADOR_ID,MFDE_ID,FECHA,TIPO_MOVIMIENTO_CUENTA,codTipMov,TIPO_MOVIMIENTO,IDENTIFICACION,PACIENTE,MFDE_MEIN_CODMEI "
		query = query + ",MFDE_MEIN_ID,nvl(MFDE_CANTIDAD,0) MFDE_CANTIDAD,nvl(MFDE_CTAS_ID,0) MFDE_CTAS_ID,nvl(MFDE_REFERENCIA_CONTABLE,0) MFDE_REFERENCIA_CONTABLE,INT_CARGO_ESTADO,INT_CARGO_FECHA "
		query = query + ",INT_CARGO_ERROR,INT_ERP_ESTADO,INT_ERP_FECHA,INT_ERP_ERROR, DESCRIPCION_PRODUCTO, CAMA_ACTUAL, nvl(SERVICIO,' ') SERVICIO,CODAMBITO,nvl(CTANUMCUENTA,0) CTANUMCUENTA, NUMERO_RECETA  "
		query = query + "from ( "
		query = query + " select NVL(MOVF_ID, 0) as MOV_ID,NVL(MFDE_ID,0) AS DET_ID,0 AS DEV_ID,NVL(MOVF_SOLI_ID, 0) as soli_id,NVL(MFDE_AGRUPADOR_ID,0) as agrupador_id,NVL(MFDE_ID,0) AS MFDE_ID, to_char(MFDE_FECHA,'dd-mm-yyyy hh24:mi:SS') FECHA  "
		query = query + " ,'CARGO' as TIPO_MOVIMIENTO_CUENTA "
		query = query + " , nvl(MFDE_TIPO_MOV, 0) as codTipMov "
		query = query + " ,(select FPAR_DESCRIPCION from clin_far_param where FPAR_TIPO = 8 and FPAR_CODIGO= MFDE_TIPO_MOV) as TIPO_MOVIMIENTO "
		query = query + " ,nvl((select CLINUMIDENTIFICACION from cliente where  cliid = clin_far_movim.movf_cliid),' ')  as IDENTIFICACION "
		query = query + " ,nvl((select trim( CLIAPEPATERNO ||' ' || CLIAPEMATERNO || ',' || CLINOMBRES)  from cliente  where cliid = clin_far_movim.movf_cliid), ' ') as PACIENTE  "
		query = query + " ,MFDE_MEIN_CODMEI,MFDE_MEIN_ID,MFDE_CANTIDAD,MFDE_CTAS_ID"
		query = query + " ,nvl(MFDE_REFERENCIA_CONTABLE, 0) as MFDE_REFERENCIA_CONTABLE "
		query = query + " ,nvl(clin_far_movimdet.INT_CARGO_ESTADO, ' ') as INT_CARGO_ESTADO "
		query = query + " ,nvl(to_char(clin_far_movimdet.INT_CARGO_FECHA), ' ' ) as INT_CARGO_FECHA "
		query = query + " ,nvl(clin_far_movimdet.INT_CARGO_ERROR, ' ') as INT_CARGO_ERROR "
		query = query + " ,nvl(clin_far_movimdet.INT_ERP_ESTADO, ' ') as INT_ERP_ESTADO "
		query = query + " ,nvl(to_char(clin_far_movimdet.INT_ERP_FECHA), ' ') as INT_ERP_FECHA "
		query = query + " ,nvl(clin_far_movimdet.INT_ERP_ERROR, ' ') as INT_ERP_ERROR "
		query = query + " ,( select mein_descri from clin_far_mamein where mein_id = MFDE_MEIN_ID )  DESCRIPCION_PRODUCTO  "
		query = query + " ,nvl(estadia.CODCAMAACTUAL,' ')  CAMA_ACTUAL "
		query = query + " ,(select nvl(serv_descripcion, ' ') from clin_servicios_logistico where clin_servicios_logistico.hdgcodigo = clin_far_movim.hdgcodigo  and clin_servicios_logistico.cmecodigo = clin_far_movim.cmecodigo and serv_codigo = (SELECT SOL.SOLI_CODSERVICIOACTUAL FROM CLIN_FAR_SOLICITUDES SOL where SOL.SOLI_ID = movf_SOLI_ID) ) SERVICIO  "
		query = query + " ,nvl(estadia.CODAMBITO,0) as CODAMBITO"
		query = query + " ,(select nvl(cuenta.ctanumcuenta,0) from cuenta where cuenta.ctaid = clin_far_movim.movf_cta_id)  as CTANUMCUENTA"
		query = query + " ,nvl( (select SOLI_NUMERO_RECETA from clin_far_solicitudes where soli_id = clin_far_movimdet.MFDE_SOLI_ID ),0) NUMERO_RECETA "
		query = query + " from clin_far_movimdet,clin_far_movim, estadia "
		query = query + " where clin_far_movimdet.MFDE_TIPO_MOV in (105,140,150,160,60,61,62,63,410,420,430) "
		query = query + " and  clin_far_movimdet.mfde_movf_id =   clin_far_movim.Movf_id "
		query = query + " and clin_far_movim.hdgcodigo = " + strconv.Itoa(res.HDGCODIGO)
		query = query + " and clin_far_movim.esacodigo = " + strconv.Itoa(res.ESACODIGO)
		query = query + " AND clin_far_movim.cmecodigo = " + strconv.Itoa(res.CMECODIGO)
		query = query + " and clin_far_movimdet.MFDE_FECHA between TO_DATE('" + res.FECHAINCIO + " 00:00:00','YYYY-MM-DD HH24:MI:SS') and TO_DATE ('" + res.FECHATERMINO + " 23:59:59' ,'YYYY-MM-DD HH24:MI:SS') "
		query = query + " and estadia.estid (+)= clin_far_movim.MOVF_ESTID "
		if res.CTANUMCUENTA > 0 {
			query = query + " and exists (select 1 from cuenta where pestid = estadia.estid and cuenta.ctanumcuenta = " + strconv.Itoa(res.CTANUMCUENTA) + " )"
		}
		if res.SOLIID > 0 {
			query = query + " and MOVF_SOLI_ID = " + strconv.Itoa(res.SOLIID)
		}
		if res.FDEID > 0 && res.TIPOMOVIMIENTOCUENTA == "DEVOLUCION" {
			// query = query + " and 1=2 "
		}

		query = query + " union all "
		query = query + " select "
		query = query + "   NVL(MOVF_ID, 0) AS MOV_ID,NVL(MFDE_ID,0) AS DET_ID,NVL(MDEV_ID,0) AS DEV_ID,NVL(MOVF_SOLI_ID, 0) as soli_id,NVL(MDEV_AGRUPADOR_ID, 0) as agrupador_id,NVL(MDEV_ID, 0) AS MDEV_ID,to_char(MDEV_FECHA,'dd-mm-yyyy hh24:mi:SS') FECHA "
		query = query + " ,'DEVOLUCION' as TIPO_MOVIMIENTO_CUENTA "
		query = query + " , nvl(mdev_movf_tipo, 0) as codTipMov "
		query = query + " ,(select FPAR_DESCRIPCION from clin_far_param where FPAR_TIPO = 8 and FPAR_CODIGO= mdev_movf_tipo) as TIPO_MOVIMIENTO "
		query = query + " ,nvl((select CLINUMIDENTIFICACION from cliente where  cliid = clin_far_movim.movf_cliid), ' ')  as IDENTIFICACION "
		query = query + " ,nvl((select trim( CLIAPEPATERNO||' ' || CLIAPEMATERNO || ',' || CLINOMBRES)  from cliente  where cliid = clin_far_movim.movf_cliid), ' ') as PACIENTE "
		query = query + " ,MFDE_MEIN_CODMEI,MFDE_MEIN_ID,MDEV_CANTIDAD,MFDE_CTAS_ID"
		query = query + " ,nvl(clin_far_movim_devol.MDEV_REFERENCIA_CONTABLE, 0) as MDEV_REFERENCIA_CONTABLE "
		query = query + " ,nvl(clin_far_movim_devol.INT_CARGO_ESTADO, ' ') as INT_CARGO_ESTADO "
		query = query + " ,nvl(to_char(clin_far_movim_devol.INT_CARGO_FECHA), ' ' )"
		query = query + " ,nvl(clin_far_movim_devol.INT_CARGO_ERROR, ' ') as INT_CARGO_ERROR "
		query = query + " ,nvl(clin_far_movim_devol.INT_ERP_ESTADO, ' ') as INT_ERP_ESTADO "
		query = query + " ,nvl(to_char(clin_far_movim_devol.INT_ERP_FECHA), ' ') as INT_ERP_FECHA "
		query = query + " ,nvl(clin_far_movim_devol.INT_ERP_ERROR, ' ') as INT_ERP_ERROR "
		query = query + " ,( select mein_descri from clin_far_mamein where mein_id = MFDE_MEIN_ID )  DESCRIPCION_PRODUCTO  "
		query = query + " ,nvl(estadia.CODCAMAACTUAL, ' ')  CAMA_ACTUAL "
		query = query + " ,(select nvl(serv_descripcion,' ') from clin_servicios_logistico where clin_servicios_logistico.hdgcodigo = clin_far_movim.hdgcodigo  and clin_servicios_logistico.cmecodigo = clin_far_movim.cmecodigo and serv_codigo = (SELECT SOL.SOLI_CODSERVICIOACTUAL FROM CLIN_FAR_SOLICITUDES SOL where SOL.SOLI_ID = movf_SOLI_ID) ) SERVICIO  "
		query = query + " ,nvl(estadia.CODAMBITO,0) as CODAMBITO "
		query = query + " ,(select nvl(cuenta.ctanumcuenta,0) from cuenta where cuenta.ctaid = clin_far_movim.movf_cta_id)  as CTANUMCUENTA"
		query = query + " ,nvl( (select SOLI_NUMERO_RECETA from clin_far_solicitudes where soli_id = clin_far_movimdet.MFDE_SOLI_ID ),0) NUMERO_RECETA "
		query = query + " from clin_far_movim_devol, clin_far_movimdet, clin_far_movim,estadia"
		query = query + " where clin_far_movimdet.MFDE_ID = clin_far_movim_devol.mdev_mfde_id "
		query = query + " and  clin_far_movimdet.mfde_movf_id =   clin_far_movim.Movf_id "
		query = query + " and clin_far_movim.hdgcodigo = " + strconv.Itoa(res.HDGCODIGO)
		query = query + " and clin_far_movim.esacodigo = " + strconv.Itoa(res.ESACODIGO)
		query = query + " AND clin_far_movim.cmecodigo = " + strconv.Itoa(res.CMECODIGO)
		query = query + " and nvl(clin_far_movim.movf_cliid,0) >0 "
		query = query + " and clin_far_movim_devol.MDEV_MOVF_TIPO in (60,61,62,63,201)"
		query = query + " and clin_far_movim_devol.MDEV_FECHA between TO_DATE('" + res.FECHAINCIO + " 00:00:00','YYYY-MM-DD HH24:MI:SS') and TO_DATE ('" + res.FECHATERMINO + " 23:59:59' ,'YYYY-MM-DD HH24:MI:SS') "
		query = query + " and estadia.estid (+)= clin_far_movim.MOVF_ESTID "
		if res.CTANUMCUENTA > 0 {
			query = query + " and exists (select 1 from cuenta where pestid = estadia.estid and cuenta.ctanumcuenta = " + strconv.Itoa(res.CTANUMCUENTA) + " )"
		}
		if res.MOVID > 0 {
			query = query + " and MOVF_SOLI_ID = " + strconv.Itoa(res.SOLIID)
		}

		if res.FDEID > 0 && res.TIPOMOVIMIENTOCUENTA == "DEVOLUCION" {
			// query = query + "and 1 = 2 "
		}
		query = query + " ) order by SOLI_ID desc, FECHA DESC"

		rows, err := db.QueryContext(ctx, query)

		logger.Trace(logs.InformacionLog{
			Query:   query,
			Mensaje: "Query listar movimientos interfaz",
		})

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   query,
				Mensaje: "Se cayo query listar movimientos interfaz",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		for rows.Next() {
			valores := models.MoviminetoInterfaz{
				MARCA:     false,
				HDGCODIGO: res.HDGCODIGO,
				ESACODIGO: res.ESACODIGO,
				CMECODIGO: res.CMECODIGO,
			}

			err := rows.Scan(
				&valores.MOVID,
				&valores.DETID,
				&valores.DEVID,
				&valores.SOLIID,
				&valores.IDAGRUPADOR,
				&valores.FDEID,
				&valores.FECHA,
				&valores.TIPOMOVIMIENTOCUENTA,
				&valores.CODTIPMOV,
				&valores.TIPOMOVIMIENTO,
				&valores.IDENTIFICACION,
				&valores.PACIENTE,
				&valores.MFDEMEINCODMEI,
				&valores.MFDEMEINID,
				&valores.MFDECANTIDAD,
				&valores.MFDECTASID,
				&valores.MFDEREFERENCIACONTABLE,
				&valores.INTCARGOESTADO,
				&valores.INTCARGOFECHA,
				&valores.INTCARGOERROR,
				&valores.INTERPESTADO,
				&valores.INTERPFECHA,
				&valores.INTERPERROR,
				&valores.DESCRIPCIONPRODUCTO,
				&valores.CAMAACTUAL,
				&valores.SERVICIO,
				&valores.CODAMBITO,
				&valores.CTANUMCUENTA,
				&valores.NUMERORECETA,
			)

			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo scan listar movimientos interfaz",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			retornoValores = append(retornoValores, valores)
		}
	}

	json.NewEncoder(w).Encode(retornoValores)
	models.EnableCors(&w)
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
