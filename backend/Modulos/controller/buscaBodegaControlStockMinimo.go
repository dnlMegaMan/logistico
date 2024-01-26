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
	. "sonda.com/logistico/Modulos/comun"
	"sonda.com/logistico/Modulos/models"
	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"
)

// BuscaBodegaControlStockMinimo is...
func BuscaBodegaControlStockMinimo(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ControlStocMinimo
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

	res := models.ControlStocMinimo{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.Usuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	models.EnableCors(&w)
	db, _ := database.GetConnection(res.Servidor)
	ctx := context.Background()
	valor, err := ObtenerClinFarParamGeneral(db, "PKGBusBodCtrlStckMin")
	if err != nil {
		http.Error(w, "Error interno del servidor", http.StatusInternalServerError)
		logger.Error(logs.InformacionLog{
			Mensaje: "Error al obtener el valor del parametro",
			Error:   err,
		})
		return
	}

	retornoValores := []models.ControlStocMinimo{}
	if valor == "SI" {
		var rowPKG driver.Rows

		logger.Trace(logs.InformacionLog{Mensaje: "Entro en la solución BuscaBodegaControlStockMinimo"})

		transaccion, err := db.Begin()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "No puede crear transacción para devolver busqueda solicitud cabecera",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		qry := "BEGIN PKG_BUSCA_BOD_CNTRL_STOCK_MIN.P_BUSCA_BOD_CNTRL_STOCK_MIN(:1,:2,:3,:4,:5,:6,:7,:8,:9); END;"

		logger.Trace(logs.InformacionLog{
			Query:   qry,
			Mensaje: "Ejecución Package BUSCA BODEGA CONTROL STOCK MINIMO",
		})

		_, err = transaccion.Exec(qry,
			PlSQLArrays,
			res.HdgCodigo,          //:1
			res.EsaCodigo,          //:2
			res.CmeCodigo,          //:3
			res.FechaInicio,        //:4
			res.FechaTermino,       //:5
			res.IDBodegaSolicita,   //:6
			res.IDBodegaSuministro, //:7
			res.IDArticulo,         //:8
			sql.Out{Dest: &rowPKG}, //:9
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   qry,
				Mensaje: "Fallo package BUSCA BODEGA CONTROL STOCK MINIMO",
				Error:   err,
				Contexto: map[string]interface{}{
					":1": res.FechaInicio, ":2": res.FechaTermino, ":3": res.IDBodegaSolicita, ":4": res.IDBodegaSuministro, ":5": res.IDArticulo,
				},
			})

			errRollback := transaccion.Rollback()
			if errRollback != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo rollback package BUSCA BODEGA CONTROL STOCK MINIMO",
					Error:   errRollback,
				})
			}

			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
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
			valores := models.ControlStocMinimo{}

			err := rows.Scan(
				&valores.FechaMovimiento,
				&valores.TipoMovimiento,
				&valores.IDBodegaSolicita,
				&valores.NomBodegaSolicta,
				&valores.IDBodegaSuministro,
				&valores.NomBodegaSuministro,
				&valores.IDArticulo,
				&valores.CodigoArticulo,
				&valores.DescArticulo,
				&valores.CatidadSolicitada,
				&valores.CantidadDespachada,
				&valores.IDSolicitud,
				&valores.IDMovimiento,
				&valores.Cantidaddeviuelta,
				&valores.CantidadPendiente,
				&valores.HdgCodigo,
				&valores.EsaCodigo,
				&valores.CmeCodigo,
				&valores.DiasDespacho,
			)

			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo scan  busca bodega control stock minimo",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			retornoValores = append(retornoValores, valores)
		}
	} else {
		query := "select   Fecha_Movimiento,Tipo_Movimiento,ID_BodegaOrigen,  Nom_BodegaSolicta,ID_BodegaSuministro,Nom_BodegaSuministro,ID_Articulo, Codigo_Articulo,Desc_Articulo,Catidad_Solicitada, Cantidad_Despachada, Numero_solicitud,Numero_Movimiento "
		query = query + ",Cantidad_deviuelta,"
		query = query + "  ( catidad_solicitada - cantidad_despachada + cantidad_deviuelta ) AS  cantidad_pendiente "
		// query = query + " (CASE  (SELECT FBOD_TIPO_BODEGA FROM CLIN_FAR_BODEGAS WHERE FBOD_CODIGO = id_bodegasuministro)"
		// query = query + "         WHEN 'G' THEN 0 "
		// query = query + "         WHEN 'O' THEN 0 "
		// query = query + "         ELSE ( catidad_solicitada - cantidad_despachada + cantidad_deviuelta ) "
		// query = query + "         END) AS  cantidad_pendiente "
		query = query + " ,hdgcodigo, esacodigo,cmecodigo, Horas_Despacho "
		query = query + "from  "
		query = query + " (  "
		query = query + " select  clin_far_solicitudes.soli_hdgcodigo as hdgcodigo,clin_far_solicitudes.soli_esacodigo as esacodigo,clin_far_solicitudes.soli_cmecodigo as cmecodigo, "
		query = query + " to_char(SOLI_FECHA_CREACION,'YYYY-MM-DD HH24:MI:SS') as Fecha_Movimiento, "
		query = query + "'Solicitud'         as Tipo_Movimiento, "
		query = query + "SOLI_BOD_ORIGEN     as ID_BodegaOrigen, "
		query = query + "(select FBOD_DESCRIPCION from clin_far_bodegas where FBOD_CODIGO = SOLI_BOD_ORIGEN) as Nom_BodegaSolicta, "
		query = query + "SOLI_BOD_DESTINO    as ID_BodegaSuministro, "
		query = query + "(select FBOD_DESCRIPCION from clin_far_bodegas where FBOD_CODIGO = SOLI_BOD_DESTINO) as Nom_BodegaSuministro, "
		query = query + "MEIN_ID    as ID_Articulo, "
		query = query + "MEIN_CODMEI as Codigo_Articulo, "
		query = query + "MEIN_DESCRI as Desc_Articulo , "
		query = query + "SODE_CANT_SOLI as Catidad_Solicitada, "
		query = query + "nvl((select sum(MFDE_CANTIDAD) "
		query = query + " from clin_far_movim, clin_far_movimdet  "
		query = query + " where clin_far_movim.HDGCODIGO=  clin_far_solicitudes.soli_hdgcodigo "
		query = query + " and clin_far_movim.ESACODIGO = clin_far_solicitudes.soli_esacodigo "
		query = query + " and clin_far_movim.CMECODIGO = clin_far_solicitudes.soli_cmecodigo  "
		query = query + " and clin_far_movim.MOVF_ID = clin_far_movimdet.MFDE_MOVF_ID  "
		query = query + " and clin_far_movim.movf_tipo IN (100, 102, 81, 80)  "
		query = query + " and clin_far_movim.MOVF_BOD_ORIGEN = clin_far_solicitudes.SOLI_BOD_ORIGEN "
		query = query + " and clin_far_movim.MOVF_BOD_DESTINO  = clin_far_solicitudes.SOLI_BOD_DESTINO "
		query = query + " and clin_far_movimdet.MFDE_TIPO_MOV IN (100, 102, 81, 80)  "
		query = query + " and clin_far_movim.MOVF_SOLI_ID = clin_far_solicitudes.soli_id "
		query = query + " and clin_far_movimdet.MFDE_MEIN_ID = clin_far_mamein.MEIN_ID  "
		query = query + " ),0) as Cantidad_Despachada,  "
		query = query + "soli_id as Numero_Solicitud, "
		query = query + "0  as Numero_Movimiento, "
		query = query + " ( select nvl(sum(MFDE_CANTIDAD),0) from clin_far_movimdet where MFDE_SOLI_ID= clin_far_solicitudes.soli_id and MFDE_TIPO_MOV=50 and MFDE_MEIN_ID=clin_far_mamein.MEIN_ID) as Cantidad_deviuelta, "
		query = query + " Round( 24 * ( nvl((select Max(MFDE_FECHA) from clin_far_movim, clin_far_movimdet where clin_far_movim.HDGCODIGO=  clin_far_solicitudes.soli_hdgcodigo and clin_far_movim.ESACODIGO = clin_far_solicitudes.soli_esacodigo "
		query = query + " and clin_far_movim.CMECODIGO = clin_far_solicitudes.soli_cmecodigo "
		query = query + " and clin_far_movim.MOVF_ID = clin_far_movimdet.MFDE_MOVF_ID "
		query = query + " and clin_far_movim.movf_tipo IN (100, 102, 81, 80) "
		query = query + " and clin_far_movim.MOVF_BOD_ORIGEN = clin_far_solicitudes.SOLI_BOD_ORIGEN "
		query = query + " and clin_far_movim.MOVF_BOD_DESTINO  = clin_far_solicitudes.SOLI_BOD_DESTINO "
		query = query + " and clin_far_movimdet.MFDE_TIPO_MOV IN (100, 102, 81, 80) "
		query = query + " and clin_far_movim.MOVF_SOLI_ID = clin_far_solicitudes.soli_id "
		query = query + " and clin_far_movimdet.MFDE_MEIN_ID = clin_far_mamein.MEIN_ID "
		query = query + " ), sysdate) - SOLI_FECHA_CREACION)   ,0)   as Horas_Despacho "
		query = query + "from clin_far_solicitudes, clin_far_solicitudes_det, clin_far_bodegas_inv,clin_far_mamein  where "
		query = query + "clin_far_solicitudes.SOLI_HDGCODIGO = " + strconv.Itoa(res.HdgCodigo) + " "
		query = query + "and clin_far_solicitudes.SOLI_ESACODIGO = " + strconv.Itoa(res.EsaCodigo) + " "
		query = query + "and clin_far_solicitudes.SOLI_CMECODIGO = " + strconv.Itoa(res.CmeCodigo) + " "
		if res.FechaInicio != "" && res.FechaTermino != "" {
			query = query + " and clin_far_solicitudes.SOLI_FECHA_CREACION between TO_DATE('" + res.FechaInicio + " 00:00:00','YYYY-MM-DD HH24:MI:SS') and TO_DATE ('" + res.FechaTermino + " 23:59:59' ,'YYYY-MM-DD HH24:MI:SS') "
		}
		if res.IDBodegaSolicita != 0 {
			query = query + "and clin_far_solicitudes.SOLI_BOD_ORIGEN = " + strconv.Itoa(res.IDBodegaSolicita) + " "
		}
		if res.IDBodegaSuministro != 0 {
			query = query + "and clin_far_solicitudes.SOLI_BOD_DESTINO = " + strconv.Itoa(res.IDBodegaSuministro) + " "
		}
		query = query + "and clin_far_solicitudes.SOLI_ID  = clin_far_solicitudes_det.SODE_SOLI_ID "
		if res.IDArticulo != 0 {
			query = query + "and clin_far_solicitudes_det.SODE_MEIN_ID = " + strconv.Itoa(res.IDArticulo) + " "
		}
		query = query + "and clin_far_bodegas_inv.FBOI_FBOD_CODIGO = clin_far_solicitudes.SOLI_BOD_ORIGEN "
		query = query + "and clin_far_bodegas_inv.FBOI_MEIN_ID =  clin_far_solicitudes_det.SODE_MEIN_ID "
		query = query + "and clin_far_bodegas_inv.FBOI_BOD_CONTROLMINIMO='S' "
		query = query + "and clin_far_mamein.MEIN_ID = clin_far_solicitudes_det.SODE_MEIN_ID "
		query = query + ") "
		query = query + "order by Fecha_Movimiento "

		rows, err := db.QueryContext(ctx, query)

		logger.Trace(logs.InformacionLog{
			Query:   query,
			Mensaje: "Query busca bodega control stock minimo",
		})

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   query,
				Mensaje: "Se cayo query busca bodega control stock minimo",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		for rows.Next() {
			valores := models.ControlStocMinimo{}

			err := rows.Scan(
				&valores.FechaMovimiento,
				&valores.TipoMovimiento,
				&valores.IDBodegaSolicita,
				&valores.NomBodegaSolicta,
				&valores.IDBodegaSuministro,
				&valores.NomBodegaSuministro,
				&valores.IDArticulo,
				&valores.CodigoArticulo,
				&valores.DescArticulo,
				&valores.CatidadSolicitada,
				&valores.CantidadDespachada,
				&valores.IDSolicitud,
				&valores.IDMovimiento,
				&valores.Cantidaddeviuelta,
				&valores.CantidadPendiente,
				&valores.HdgCodigo,
				&valores.EsaCodigo,
				&valores.CmeCodigo,
				&valores.DiasDespacho,
			)

			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo scan  busca bodega control stock minimo",
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
