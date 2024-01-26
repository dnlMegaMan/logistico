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

	"sonda.com/logistico/Modulos/comun"
	"sonda.com/logistico/Modulos/models"
	logs "sonda.com/logistico/logging"

	database "sonda.com/logistico/pkg_conexion"
)

// ListarMovimientoInterfazCargo is...
func ListarMovimientoInterfazCargo(w http.ResponseWriter, r *http.Request) {
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
	ctx := context.Background()

	retornoValores := []models.MoviminetoInterfaz{}

	valor, err := comun.ObtenerClinFarParamGeneral(db, "usaPCKLisMovIntCar")
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

		logger.Trace(logs.InformacionLog{Mensaje: "Entro en la solución listarMovimientoInterfazCargo"})

		transaction, err := db.Begin()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "No puede crear transacción para devolver listar movimiento interfaz cargo",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		qry := "BEGIN PKG_LISTAR_MOVIMIENTO_INTERFAZ_CARGO.P_LISTAR_MOVIMIENTO_INTERFAZ_CARGO(:1,:2,:3,:4,:5,:6,:7,:8,:9); END;"

		logger.Trace(logs.InformacionLog{
			Query:   qry,
			Mensaje: "Ejecución Package listarMovimientoInterfazCargo",
		})

		_, err = transaction.Exec(qry,
			PlSQLArrays,
			strconv.Itoa(res.HDGCODIGO),    // :1
			strconv.Itoa(res.ESACODIGO),    // :2
			strconv.Itoa(res.CMECODIGO),    // :3
			res.FECHAINCIO,                 // :4
			res.FECHATERMINO,               // :5
			strconv.Itoa(res.CTANUMCUENTA), // :6
			strconv.Itoa(res.FDEID),        // :7
			res.TIPOMOVIMIENTOCUENTA,       // :8
			sql.Out{Dest: &rows},           // :9
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   qry,
				Mensaje: "Fallo package al listar movimiento interfaz cargo",
				Error:   err,
				Contexto: map[string]interface{}{
					":1": res.HDGCODIGO, ":2": res.CMECODIGO, ":3": res.FECHAINCIO,
					":4": res.FECHATERMINO, ":5": res.CTANUMCUENTA, ":6": res.FDEID,
					":7": res.TIPOMOVIMIENTOCUENTA,
				},
			})

			errRollback := transaction.Rollback()
			if errRollback != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo rollback package listar movimiento interfaz cargo",
					Error:   errRollback,
				})
			}

			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		defer rows.Close()

		sub, err := WrapRows(ctx, db, rows)
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo wrap rows",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		defer sub.Close()

		for sub.Next() {
			valores := models.MoviminetoInterfaz{
				MARCA:     false,
				HDGCODIGO: res.HDGCODIGO,
				ESACODIGO: res.ESACODIGO,
				CMECODIGO: res.CMECODIGO,
			}

			err := sub.Scan(
				&valores.MOVID,
				&valores.DETID,
				&valores.DEVID,
				&valores.FDEID,
				&valores.SOLIID,
				&valores.IDAGRUPADOR,
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
					Mensaje: "Se cayo scan listar movimientos interfaz cargo",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			retornoValores = append(retornoValores, valores)
		}
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
		query = query + " ,nvl(INT_CARGO_ESTADO, ' ') as INT_CARGO_ESTADO "
		query = query + " ,nvl(to_char(INT_CARGO_FECHA), ' ' ) as INT_CARGO_FECHA "
		query = query + " ,nvl(clin_far_movimdet.INT_CARGO_ERROR, ' ') as INT_CARGO_ERROR "
		query = query + " ,nvl(clin_far_movimdet.INT_ERP_ESTADO, ' ') as INT_ERP_ESTADO "
		query = query + " ,nvl(to_char(clin_far_movimdet.INT_ERP_FECHA), ' ') as INT_ERP_FECHA "
		query = query + " ,nvl(clin_far_movimdet.INT_ERP_ERROR, ' ') as INT_ERP_ERROR "
		query = query + " ,( select mein_descri from clin_far_mamein where mein_id = MFDE_MEIN_ID )  DESCRIPCION_PRODUCTO  "
		query = query + " ,nvl(estadia.CODCAMAACTUAL,' ')  CAMA_ACTUAL "
		query = query + " ,(select nvl(serv_descripcion, ' ') from clin_servicios_logistico where clin_servicios_logistico.hdgcodigo = clin_far_movim.hdgcodigo  and clin_servicios_logistico.cmecodigo = clin_far_movim.cmecodigo and serv_codigo = estadia.codservicioactual ) SERVICIO  "
		query = query + " ,nvl(estadia.CODAMBITO,0) as CODAMBITO"
		query = query + " ,(select nvl(cuenta.ctanumcuenta,0) from cuenta where cuenta.ctaid = clin_far_movim.movf_cta_id)  as CTANUMCUENTA"
		query = query + " ,nvl( (select SOLI_NUMERO_RECETA from clin_far_solicitudes where soli_id = clin_far_movimdet.MFDE_SOLI_ID ),0) NUMERO_RECETA "
		query = query + " from clin_far_movimdet,clin_far_movim, estadia "
		query = query + " where clin_far_movimdet.MFDE_TIPO_MOV in (140,150,160,630,600,610,620,630) "
		query = query + " and  clin_far_movimdet.mfde_movf_id =   clin_far_movim.Movf_id "
		query = query + " and  clin_far_movimdet.hdgcodigo =   clin_far_movim.hdgcodigo "
		query = query + " and  clin_far_movimdet.esacodigo =   clin_far_movim.esacodigo "
		query = query + " and  clin_far_movimdet.cmecodigo =   clin_far_movim.cmecodigo "
		query = query + " and clin_far_movim.hdgcodigo = " + strconv.Itoa(res.HDGCODIGO)
		query = query + " and clin_far_movim.esacodigo = " + strconv.Itoa(res.ESACODIGO)
		query = query + " AND clin_far_movim.cmecodigo = " + strconv.Itoa(res.CMECODIGO)
		query = query + " and clin_far_movimdet.MFDE_FECHA between TO_DATE('" + res.FECHAINCIO + " 00:00:00','YYYY-MM-DD HH24:MI:SS') and TO_DATE ('" + res.FECHATERMINO + " 23:59:59' ,'YYYY-MM-DD HH24:MI:SS') "
		query = query + " and estadia.estid (+)= clin_far_movim.MOVF_ESTID "
		if res.CTANUMCUENTA > 0 {
			query = query + " and exists (select 1 from cuenta where pestid = estadia.estid and cuenta.ctanumcuenta = " + strconv.Itoa(res.CTANUMCUENTA) + " )"
		}
		if res.FDEID > 0 && res.TIPOMOVIMIENTOCUENTA == "CARGO" {
			query = query + " and MFDE_ID = " + strconv.Itoa(res.FDEID)
		}
		if res.FDEID > 0 && res.TIPOMOVIMIENTOCUENTA == "DEVOLUCION" {
			query = query + " and 1=2 "
		}

		// query = query + " union all "
		// query = query + " select "
		// query = query + "   NVL(MOVF_ID, 0) AS MOV_ID,NVL(MFDE_ID,0) AS DET_ID,NVL(MDEV_ID,0) AS DEV_ID,NVL(MOVF_SOLI_ID, 0) as soli_id,NVL(MDEV_AGRUPADOR_ID, 0) as agrupador_id,NVL(MDEV_ID, 0) AS MDEV_ID,to_char(MDEV_FECHA,'dd-mm-yyyy hh24:mi:SS') FECHA "
		// query = query + " ,'DEVOLUCION' as TIPO_MOVIMIENTO_CUENTA "
		// query = query + " , nvl(mdev_movf_tipo, 0) as codTipMov "
		// query = query + " ,(select FPAR_DESCRIPCION from clin_far_param where FPAR_TIPO = 8 and FPAR_CODIGO= mdev_movf_tipo) as TIPO_MOVIMIENTO "
		// query = query + " ,nvl((select CLINUMIDENTIFICACION from cliente where  cliid = clin_far_movim.movf_cliid), ' ')  as IDENTIFICACION "
		// query = query + " ,nvl((select trim( CLIAPEPATERNO||' ' || CLIAPEMATERNO || ',' || CLINOMBRES)  from cliente  where cliid = clin_far_movim.movf_cliid), ' ') as PACIENTE "
		// query = query + " ,MFDE_MEIN_CODMEI,MFDE_MEIN_ID,MDEV_CANTIDAD,MFDE_CTAS_ID"
		// query = query + " ,nvl(clin_far_movim_devol.MDEV_REFERENCIA_CONTABLE, 0) as MDEV_REFERENCIA_CONTABLE "
		// query = query + " ,nvl(clin_far_movim_devol.INT_CARGO_ESTADO, ' ') as INT_CARGO_ESTADO "
		// query = query + " ,nvl(to_char(clin_far_movim_devol.INT_CARGO_FECHA), ' ' )"
		// query = query + " ,nvl(clin_far_movim_devol.INT_CARGO_ERROR, ' ') as INT_CARGO_ERROR "
		// query = query + " ,nvl(clin_far_movim_devol.INT_ERP_ESTADO, ' ') as INT_ERP_ESTADO "
		// query = query + " ,nvl(to_char(clin_far_movim_devol.INT_ERP_FECHA), ' ') as INT_ERP_FECHA "
		// query = query + " ,nvl(clin_far_movim_devol.INT_ERP_ERROR, ' ') as INT_ERP_ERROR "
		// query = query + " ,( select mein_descri from clin_far_mamein where mein_id = MFDE_MEIN_ID )  DESCRIPCION_PRODUCTO  "
		// query = query + " ,nvl(estadia.CODCAMAACTUAL, ' ')  CAMA_ACTUAL "
		// query = query + " ,(select nvl(serv_descripcion,' ') from clin_servicios_logistico where clin_servicios_logistico.hdgcodigo = clin_far_movim.hdgcodigo  and clin_servicios_logistico.cmecodigo = clin_far_movim.cmecodigo and serv_codigo = estadia.codservicioactual ) SERVICIO  "
		// query = query + " ,nvl(estadia.CODAMBITO,0) as CODAMBITO"
		// query = query + " ,(select nvl(cuenta.ctanumcuenta,0) from cuenta where cuenta.ctaid = clin_far_movim.movf_cta_id)  as CTANUMCUENTA"
		// query = query + " ,nvl( (select SOLI_NUMERO_RECETA from clin_far_solicitudes where soli_id = clin_far_movimdet.MFDE_SOLI_ID ),0) NUMERO_RECETA "
		// query = query + " from clin_far_movim_devol, clin_far_movimdet, clin_far_movim,estadia"
		// query = query + " where clin_far_movimdet.MFDE_ID = clin_far_movim_devol.mdev_mfde_id "
		// query = query + " and  clin_far_movimdet.mfde_movf_id =   clin_far_movim.Movf_id "
		// query = query + " and clin_far_movim.hdgcodigo = " + strconv.Itoa(res.HDGCODIGO)
		// query = query + " AND clin_far_movim.cmecodigo = " + strconv.Itoa(res.CMECODIGO)
		// query = query + " and nvl(clin_far_movim.movf_cliid,0) >0  "
		// query = query + " and clin_far_movim_devol.MDEV_MOVF_TIPO <> 201 "
		// query = query + " and clin_far_movim_devol.MDEV_MOVF_TIPO <> 60 "
		// query = query + " and clin_far_movim_devol.MDEV_FECHA between TO_DATE('" + res.FECHAINCIO + " 00:00:00','YYYY-MM-DD HH24:MI:SS') and TO_DATE ('" + res.FECHATERMINO + " 23:59:59' ,'YYYY-MM-DD HH24:MI:SS') "
		// query = query + " and estadia.estid (+)= clin_far_movim.MOVF_ESTID "
		// if res.CTANUMCUENTA > 0 {
		// 	query = query + " and exists (select 1 from cuenta where pestid = estadia.estid and cuenta.ctanumcuenta = " + strconv.Itoa(res.CTANUMCUENTA) + " )"
		// }
		// if res.FDEID > 0 && res.TIPOMOVIMIENTOCUENTA == "DEVOLUCION" {
		// 	query = query + " and MDEV_ID = " + strconv.Itoa(res.FDEID)
		// }

		// if res.FDEID > 0 && res.TIPOMOVIMIENTOCUENTA == "DEVOLUCION" {
		// 	query = query + " 1 = 2 "
		// }
		query = query + " ) order by SOLI_ID , FECHA DESC"

		rows, err := db.QueryContext(ctx, query)

		logger.Trace(logs.InformacionLog{
			Query:   query,
			Mensaje: "Query listar movimientos interfaz cargo",
		})

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   query,
				Mensaje: "Se cayo query listar movimientos interfaz cargo",
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
				&valores.FDEID,
				&valores.SOLIID,
				&valores.IDAGRUPADOR,
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
					Mensaje: "Se cayo scan listar movimientos interfaz cargo",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			retornoValores = append(retornoValores, valores)
		}
	}
	json.NewEncoder(w).Encode(retornoValores)

	logger.LoguearSalida()
}
