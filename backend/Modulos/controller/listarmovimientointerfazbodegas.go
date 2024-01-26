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

// ListarMovimientoInterfazBodegas is...
func ListarMovimientoInterfazBodegas(w http.ResponseWriter, r *http.Request) {
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
	var msg models.MovimientoInterfazBodegas

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

	res := models.MovimientoInterfazBodegas{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.USUARIO)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	models.EnableCors(&w)

	db, _ := database.GetConnection(res.SERVIDOR)

	query := "select nvl(ID,0) ID, nvl(soliid, 0) soliid, nvl(FECHA,' ') FECHA,TIPO, CODTIPMOV, nvl(TIPO_MOVIMIENTO,' ') TIPO_MOVIMIENTO, nvl(BODEGA_ORIGEN,' ') BODEGA_ORIGEN "
	query = query + " , nvl(BODEGA_DESTINO, ' ') BODEGA_DESTINO, nvl(CODIGO_ARTICULO, ' ') CODIGO_ARTICULO, nvl(ID_ARTICULO,0) ID_ARTICULO "
	query = query + ", nvl(CANTIDAD,0) CANTIDAD, nvl(REFERENCIA_CONTABLE,0) REFERENCIA_CONTABLE, nvl(INT_CARGO_ESTADO,' ') INT_CARGO_ESTADO "
	query = query + ", nvl(INT_CARGO_FECHA, ' ') INT_CARGO_FECHA,nvl(INT_CARGO_ERROR,' ') INT_CARGO_ERROR,nvl(INT_ERP_ESTADO, ' ') INT_ERP_ESTADO, nvl(INT_ERP_ERROR, ' ') INT_ERP_ERROR, nvl(INT_ERP_FECHA, ' ') INT_ERP_FECHA,nvl(DESCRIPCION_PRODUCTO, ' ') DESCRIPCION_PRODUCTO,nvl(agrupador, 0) agrupador "
	query = query + " from ( "
	query = query + " select "
	query = query + "   MFDE_ID ID "
	query = query + " , mfde_soli_id soliid "
	query = query + " , to_char(MFDE_FECHA,'dd-mm-yyyy hh24:mi') FECHA  "
	query = query + " ,'BODEGAS' as TIPO "
	query = query + " ,nvl(MFDE_TIPO_MOV, 0) as CODTIPMOV "
	query = query + " ,(select FPAR_DESCRIPCION from clin_far_param where FPAR_TIPO = 8 and FPAR_CODIGO= MFDE_TIPO_MOV) as TIPO_MOVIMIENTO "
	query = query + " ,(select nvl(FBOD_DESCRIPCION,' ') from clin_far_bodegas where clin_far_bodegas.hdgcodigo = clin_far_movim.hdgcodigo and clin_far_bodegas.esacodigo = clin_far_movim.esacodigo and clin_far_bodegas.cmecodigo = clin_far_movim.cmecodigo and FBOD_CODIGO= clin_far_movim.MOVF_BOD_ORIGEN) as BODEGA_ORIGEN "
	query = query + " ,(select nvl(FBOD_DESCRIPCION,' ') from clin_far_bodegas where clin_far_bodegas.hdgcodigo = clin_far_movim.hdgcodigo and clin_far_bodegas.esacodigo = clin_far_movim.esacodigo and clin_far_bodegas.cmecodigo = clin_far_movim.cmecodigo and FBOD_CODIGO= clin_far_movim.MOVF_BOD_DESTINO) as BODEGA_DESTINO "
	query = query + " ,MFDE_MEIN_CODMEI CODIGO_ARTICULO "
	query = query + " ,MFDE_MEIN_ID     ID_ARTICULO "
	query = query + " ,MFDE_CANTIDAD    CANTIDAD "
	query = query + " ,nvl(MFDE_REFERENCIA_CONTABLE, 0) as REFERENCIA_CONTABLE "
	query = query + " ,nvl(clin_far_movimdet.INT_CARGO_ESTADO, ' ') as INT_CARGO_ESTADO "
	query = query + " ,nvl(to_char(clin_far_movimdet.INT_CARGO_FECHA), ' ' ) as INT_CARGO_FECHA "
	query = query + " ,nvl(clin_far_movimdet.INT_CARGO_ERROR, ' ') as INT_CARGO_ERROR "
	query = query + " ,nvl(clin_far_movimdet.INT_ERP_ESTADO, ' ') as INT_ERP_ESTADO "
	query = query + " ,nvl(to_char(clin_far_movimdet.INT_ERP_FECHA), ' ') as INT_ERP_FECHA "
	query = query + " ,nvl(clin_far_movimdet.INT_ERP_ERROR, ' ') as INT_ERP_ERROR "
	query = query + " ,( select mein_descri from clin_far_mamein where mein_id = MFDE_MEIN_ID )  DESCRIPCION_PRODUCTO  "
	query = query + " ,NVL(MFDE_AGRUPADOR_ID, 0 )  AGRUPADOR "
	query = query + " from clin_far_movimdet,clin_far_movim  "
	query = query + " where clin_far_movimdet.MFDE_TIPO_MOV in (16,17,30,32,50,63,100,105,116,117) "
	query = query + " and  clin_far_movimdet.mfde_movf_id =   clin_far_movim.Movf_id "
	query = query + " and  clin_far_movimdet.hdgcodigo =   clin_far_movim.hdgcodigo "
	query = query + " and  clin_far_movimdet.esacodigo =   clin_far_movim.esacodigo "
	query = query + " and  clin_far_movimdet.cmecodigo =   clin_far_movim.cmecodigo "
	query = query + " and clin_far_movim.hdgcodigo =" + strconv.Itoa(res.HDGCODIGO)
	query = query + " and clin_far_movim.esacodigo = " + strconv.Itoa(res.ESACODIGO)
	query = query + " AND clin_far_movim.cmecodigo = " + strconv.Itoa(res.CMECODIGO)
	query = query + " and clin_far_movimdet.int_erp_estado in ('PENDIENTE','ERROR','TRASPASADO','OBSERVADO') "
	if res.FECHAINCIO != "" && res.FECHATERMINO != "" {
		query = query + " and clin_far_movimdet.MFDE_FECHA between TO_DATE('" + res.FECHAINCIO + " 00:00:00','YYYY-MM-DD HH24:MI:SS') and TO_DATE ('" + res.FECHATERMINO + " 23:59:59' ,'YYYY-MM-DD HH24:MI:SS') "
	}
	if res.SOLIID != 0 {
		query = query + " and clin_far_movim.movf_soli_id = " + strconv.Itoa(res.SOLIID)
	}
	if res.ID != 0 {
		query = query + " and clin_far_movim.movf_id = " + strconv.Itoa(res.ID)
	}
	query = query + " union all "
	query = query + " select "
	query = query + "  MDEV_ID ID, mdev_soli_id soliid, to_char(MDEV_FECHA,'dd-mm-yyyy hh24:mi') FECHA  "
	query = query + " ,'BODEGAS' as TIPO  "
	query = query + " ,nvl(MDEV_MOVF_TIPO, 0) as CODTIPMOV "
	query = query + " ,(select FPAR_DESCRIPCION from clin_far_param where FPAR_TIPO = 8 and FPAR_CODIGO= MDEV_MOVF_TIPO) as TIPO_MOVIMIENTO "
	query = query + " ,(select nvl(FBOD_DESCRIPCION,' ') from clin_far_bodegas where clin_far_bodegas.hdgcodigo = clin_far_movim.hdgcodigo and clin_far_bodegas.esacodigo = clin_far_movim.esacodigo and clin_far_bodegas.cmecodigo = clin_far_movim.cmecodigo and FBOD_CODIGO= clin_far_movim.MOVF_BOD_ORIGEN) as BODEGA_ORIGEN "
	query = query + " ,(select nvl(FBOD_DESCRIPCION,' ') from clin_far_bodegas where clin_far_bodegas.hdgcodigo = clin_far_movim.hdgcodigo and clin_far_bodegas.esacodigo = clin_far_movim.esacodigo and clin_far_bodegas.cmecodigo = clin_far_movim.cmecodigo and FBOD_CODIGO= clin_far_movim.MOVF_BOD_DESTINO) as BODEGA_DESTINO "
	query = query + " ,MFDE_MEIN_CODMEI CODIGO_ARTICULO "
	query = query + " ,MFDE_MEIN_ID     CODIGO_ID "
	query = query + " ,MDEV_CANTIDAD    CANTIDAD "
	query = query + " ,nvl(clin_far_movim_devol.MDEV_REFERENCIA_CONTABLE, 0) as REFERENCIA_CONTABLE "
	query = query + " ,nvl(clin_far_movim_devol.INT_CARGO_ESTADO, ' ') as INT_CARGO_ESTADO "
	query = query + " ,nvl(to_char(clin_far_movim_devol.INT_CARGO_FECHA), ' ' ) as INT_CARGO_FECHA "
	query = query + ",nvl(clin_far_movim_devol.INT_CARGO_ERROR, ' ') as INT_CARGO_ERROR "
	query = query + ",nvl(clin_far_movim_devol.INT_ERP_ESTADO, ' ') as INT_ERP_ESTADO "
	query = query + " ,nvl(to_char(clin_far_movim_devol.INT_ERP_FECHA), ' ') as INT_ERP_FECHA "
	query = query + " ,nvl(clin_far_movim_devol.INT_ERP_ERROR, ' ') as INT_ERP_ERROR "
	query = query + " ,( select mein_descri from clin_far_mamein where mein_id = MFDE_MEIN_ID )  DESCRIPCION_PRODUCTO   "
	query = query + " ,NVL(MDEV_AGRUPADOR_ID, 0 )  AGRUPADOR "
	query = query + " from clin_far_movimdet,clin_far_movim, clin_far_movim_devol "
	query = query + " where clin_far_movimdet.MFDE_ID = clin_far_movim_devol.mdev_mfde_id  "
	query = query + " and not clin_far_movim_devol.MDEV_MOVF_TIPO in (60,70,140) and clin_far_movim_devol.MDEV_MOVF_TIPO <> 201"
	query = query + " and  clin_far_movimdet.mfde_movf_id =   clin_far_movim.Movf_id "
	query = query + " and  clin_far_movimdet.hdgcodigo =   clin_far_movim.hdgcodigo "
	query = query + " and  clin_far_movimdet.esacodigo =   clin_far_movim.esacodigo "
	query = query + " and  clin_far_movimdet.cmecodigo =   clin_far_movim.cmecodigo "
	query = query + " and clin_far_movim.hdgcodigo = " + strconv.Itoa(res.HDGCODIGO)
	query = query + " and clin_far_movim.esacodigo = " + strconv.Itoa(res.ESACODIGO)
	query = query + " and clin_far_movim.cmecodigo = " + strconv.Itoa(res.CMECODIGO)
	if res.FECHAINCIO != "" && res.FECHATERMINO != "" {
		query = query + " and clin_far_movim_devol.MDEV_FECHA between TO_DATE('" + res.FECHAINCIO + " 00:00:00','YYYY-MM-DD HH24:MI:SS') and TO_DATE ('" + res.FECHATERMINO + " 23:59:59' ,'YYYY-MM-DD HH24:MI:SS')  "
	}
	query = query + " and clin_far_movim_devol.INT_ERP_ESTADO in ('PENDIENTE','ERROR','TRASPASADO','OBSERVADO') "
	if res.SOLIID != 0 {
		query = query + " and clin_far_movim.movf_soli_id = " + strconv.Itoa(res.SOLIID)
	}
	if res.ID != 0 {
		query = query + " and clin_far_movim.movf_id = " + strconv.Itoa(res.ID)
	}
	query = query + ")  order by ID "

	retornoValores := []models.MovimientoInterfazBodegas{}
	///buscar valor del FLAG en BD
	valor, err := param.ObtenerClinFarParamGeneral(db, "usaPCKLisMovInBod")
	if err != nil {
		http.Error(w, "Error interno del servidor", http.StatusInternalServerError)
		logger.Error(logs.InformacionLog{
			Mensaje: "Error al obtener el valor del parámetro",
			Error:   err,
		})
		return
	}

	if valor == "SI" {
		ctx := context.Background()
		var rows driver.Rows

		logger.Info(logs.InformacionLog{Query: "Entro en la solucion [listarmovimientointerfazbodegas.go] por package PKG_LISTAR_MOVIMIENTO_INTERFAZ_BODEGAS.P_LISTAR_MOVIMIENTO_INTERFAZ_BODEGAS", Mensaje: "Entro en la soluci�n ListarMovimientoInterfazBodegas [listarmovimientointerfazbodegas.go] por package PKG_LISTAR_MOVIMIENTO_INTERFAZ_BODEGAS.P_LISTAR_MOVIMIENTO_INTERFAZ_BODEGAS"})
		transaccion, err := db.Begin()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "No puede crear transaccion para devolver ListarMovimientoInterfazBodegas",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		qry := "BEGIN PKG_LISTAR_MOVIMIENTO_INTERFAZ_BODEGAS.P_LISTAR_MOVIMIENTO_INTERFAZ_BODEGAS(:1,:2,:3,:4,:5,:6,:7,:8); END;"
		_, err = transaccion.Exec(qry,
			PlSQLArrays,
			res.HDGCODIGO,        // :1
			res.ESACODIGO,        // :2
			res.CMECODIGO,        // :3
			res.FECHAINCIO,       // :4
			res.FECHATERMINO,     // :5
			res.SOLIID,           // :6
			res.ID,               // :7
			sql.Out{Dest: &rows}) // :8

		logger.Info(logs.InformacionLog{Query: qry, Mensaje: "Ejecucion Package ListarMovimientoInterfazBodegas"})

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Fallo package al ListarMovimientoInterfazBodegas",
				Error:   err,
			})
			err = transaccion.Rollback()
		}

		fmt.Println(rows)
		defer rows.Close()
		sub, err := WrapRows(ctx, db, rows)
		if err != nil {
			fmt.Println(err.Error())
		}
		defer sub.Close()
		fmt.Println("Sub", sub)

		retornoValores = iteratorListarMovimientoIntBodegas(sub, res, logger, w, retornoValores)

	} else {
		ctx := context.Background()
		rows, err := db.QueryContext(ctx, query)

		logger.Trace(logs.InformacionLog{
			Query:   query,
			Mensaje: "Query listar movimiento interfaz bodegas",
		})

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   query,
				Mensaje: "Se cayo query listar movimiento interfaz bodegas",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		retornoValores = iteratorListarMovimientoIntBodegas(rows, res, logger, w, retornoValores)
	}

	json.NewEncoder(w).Encode(retornoValores)
	models.EnableCors(&w)
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}

func iteratorListarMovimientoIntBodegas(rows *sql.Rows, res models.MovimientoInterfazBodegas, logger *logs.LogisticoLogger, w http.ResponseWriter, retornoValores []models.MovimientoInterfazBodegas) []models.MovimientoInterfazBodegas {
	for rows.Next() {

		var IDARTICULO int

		valores := models.MovimientoInterfazBodegas{
			MARCA:     false,
			HDGCODIGO: res.HDGCODIGO,
			ESACODIGO: res.ESACODIGO,
			CMECODIGO: res.CMECODIGO,
		}

		err := rows.Scan(
			&valores.ID,
			&valores.SOLIID,
			&valores.FECHA,
			&valores.TIPO,
			&valores.CODTIPMOV,
			&valores.TIPOMOVIMIENTO,
			&valores.BODEGAORIGEN,
			&valores.BODEGADESTINO,
			&valores.CODIGOARTICULO,
			&IDARTICULO,
			&valores.CANTIDAD,
			&valores.REFERENCIACONTABLE,
			&valores.INTCARGOESTADO,
			&valores.INTCARGOFECHA,
			&valores.INTCARGOERROR,
			&valores.INTERPESTADO,
			&valores.INTERPERROR,
			&valores.INTERPFECHA,
			&valores.DESCRIPCIONPRODUCTO,
			&valores.AGRUPADOR,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan listar movimiento interfaz bodegas",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return nil
		}

		retornoValores = append(retornoValores, valores)
	}
	return retornoValores
}
