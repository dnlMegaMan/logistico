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

	. "github.com/godror/godror"
	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"

	"sonda.com/logistico/Modulos/models"

	param "sonda.com/logistico/Modulos/comun"
)

// ProductosDespachoAutopedido is...
func ProductosDespachoAutopedido(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ParamProdRecepcionBod
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

	res := models.ParamProdRecepcionBod{}
	json.Unmarshal([]byte(output), &res)

	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	db, _ := database.GetConnection(res.PiServidor)

	var qry string
	qry = "SELECT sol.soli_id, det.sode_id, mdet.mfde_id"
	qry = qry + " ,to_char(mdet.MFDE_FECHA,'yyyy-mm-dd hh24:mi') fecha_recepcion"
	qry = qry + " ,mdet.mfde_lote"
	qry = qry + " ,to_char(mdet.mfde_lote_fechavto, 'yyyy-mm-dd')  fechavto"
	qry = qry + " ,mdet.mfde_cantidad   cantidad_recepcionada"
	qry = qry + " ,nvl(( select sum(mdev_cantidad) from clin_far_movim_devol where mdev_mfde_id  =  mdet.mfde_id ),0) cantidad_devuelta"
	qry = qry + " ,SODE_MEIN_ID"
	qry = qry + " ,SODE_MEIN_CODMEI"
	qry = qry + " ,nvl( (SELECT TRIM(mame.mein_descri)  FROM  clin_far_mamein mame"
	qry = qry + " WHERE mame.mein_id = det.sode_mein_id"
	qry = qry + " AND mame.hdgcodigo = sol.soli_hdgcodigo), ' ') descri"
	qry = qry + " ,SODE_CANT_SOLI"
	qry = qry + " ,SODE_CANT_DESP"
	qry = qry + " FROM  clin_far_solicitudes sol"
	qry = qry + " ,clin_far_solicitudes_det det"
	qry = qry + " ,clin_far_movim           mov"
	qry = qry + " ,clin_far_movimdet        mdet"
	qry = qry + " WHERE sol.soli_id = det.sode_soli_id"
	qry = qry + " AND sol.soli_hdgcodigo = " + strconv.Itoa(res.PiHDGCodigo)
	qry = qry + " AND sol.soli_esacodigo = " + strconv.Itoa(res.PiESACodigo)
	qry = qry + " AND sol.soli_cmecodigo = " + strconv.Itoa(res.PiCMECodigo)
	qry = qry + " AND det.sode_mein_codmei = '" + res.PiCodMei + "'"
	qry = qry + " AND det.sode_mein_id = mdet.mfde_mein_id"
	qry = qry + " AND det.sode_soli_id = mov.movf_soli_id"
	qry = qry + " AND mov.movf_id = mdet.mfde_movf_id"
	qry = qry + " AND mdet.MFDE_TIPO_MOV = 105"
	qry = qry + " AND det.sode_soli_id = " + strconv.Itoa(res.PiSoliID)
	qry = qry + " ORDER BY sol.soli_id, mdet.mfde_id"

	ctx := context.Background()

	///buscar valor del FLAG en BD
	valor, err := param.ObtenerClinFarParamGeneral(db, "usaPCKProDesAuto")
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
		logger.Info(logs.InformacionLog{Query: "Entro en la solución [productosDespachoAutopedido.go] por package PKG_PRODUCTOS_DESPACHO_AUTOPEDIDO.P_PRODUCTOS_DESPACHO_AUTOPEDIDO", Mensaje: "Entro en la solución ProductosDespachoAutopedido [productosDespachoAutopedido.go] por package PKG_PRODUCTOS_DESPACHO_AUTOPEDIDO.P_PRODUCTOS_DESPACHO_AUTOPEDIDO"})
		transaccion, err := db.Begin()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "No puede crear transacción para devolver productos despacho autopedido",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		qry := "BEGIN PKG_PRODUCTOS_DESPACHO_AUTOPEDIDO.P_PRODUCTOS_DESPACHO_AUTOPEDIDO(:1,:2,:3,:4,:5,:6); END;"
		_, err = transaccion.Exec(qry,
			PlSQLArrays,
			res.PiHDGCodigo,      // :1
			res.PiESACodigo,      // :2
			res.PiCMECodigo,      // :3
			res.PiCodMei,         // :4
			res.PiSoliID,         // :5
			sql.Out{Dest: &rows}) // :6
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Fallo package al buscar estructura recetas",
				Error:   err,
			})
			err = transaccion.Rollback()
		}
		logger.Info(logs.InformacionLog{Query: qry, Mensaje: "Ejecución Package PKG_PRODUCTOS_DESPACHO_AUTOPEDIDO.P_PRODUCTOS_DESPACHO_AUTOPEDIDO"})
		fmt.Println(rows)
		defer rows.Close()
		sub, err := WrapRows(ctx, db, rows)
		if err != nil {
			fmt.Println(err.Error())
		}
		defer sub.Close()
		fmt.Println("Sub", sub)

		retornoValores := []models.ProdRecepcionBod{}
		for sub.Next() {
			valores := models.ProdRecepcionBod{}

			err := sub.Scan(
				&valores.SoliID,
				&valores.SodeID,
				&valores.MfDeID,
				&valores.FechaRecepcion,
				&valores.Lote,
				&valores.FechaVto,
				&valores.CantRecepcionada,
				&valores.CantDevuelta,
				&valores.MeInID,
				&valores.CodMei,
				&valores.MeInDescri,
				&valores.CantSoli,
				&valores.CantDespachada,
			)

			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo scan productos despacho autopedido",
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

	} else {
		ctx := context.Background()
		rows, err := db.QueryContext(ctx, qry)

		logger.Trace(logs.InformacionLog{
			Query:   qry,
			Mensaje: "Query productos despacho autopedido",
		})

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   qry,
				Mensaje: "Se cayo query productos despacho autopedido",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		retornoValores := []models.ProdRecepcionBod{}
		for rows.Next() {
			valores := models.ProdRecepcionBod{}

			err := rows.Scan(
				&valores.SoliID,
				&valores.SodeID,
				&valores.MfDeID,
				&valores.FechaRecepcion,
				&valores.Lote,
				&valores.FechaVto,
				&valores.CantRecepcionada,
				&valores.CantDevuelta,
				&valores.MeInID,
				&valores.CodMei,
				&valores.MeInDescri,
				&valores.CantSoli,
				&valores.CantDespachada,
			)

			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo scan productos despacho autopedido",
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

}
