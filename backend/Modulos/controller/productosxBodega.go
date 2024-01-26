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

// ProductosxBodega is...
func ProductosxBodega(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ParamBuscaArticulosxBod
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
	// marshal
	output, err := json.Marshal(msg)
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "No puede volver a crear JSON",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	res := models.ParamBuscaArticulosxBod{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.PiUsuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	db, _ := database.GetConnection(res.PiServidor)

	query := "SELECT inv.fboi_id, inv.fboi_fbod_codigo, bod.HDGCodigo, bod.ESACodigo, bod.CMECodigo, inv.fboi_mein_id"
	query += ", inv.fboi_punreo, inv.fboi_stocri, inv.fboi_stock_actual, bod.fbod_descripcion, med.mein_codmei, med.mein_descri, med.mein_tiporeg"
	query += ", nvl(med.mein_tipomed,1), mein_valcos, mein_margen, mein_valven, mein_u_comp, mein_u_desp, mein_incob_fonasa, mein_tipo_incob,FBOI_BOD_CONTROLMINIMO"
	query += ", mein_estado, null, inv.fboi_nivel_reposicion "
	query += " FROM CLIN_FAR_BODEGAS_INV inv, CLIN_FAR_BODEGAS bod, CLIN_FAR_MAMEIN med "
	query += " WHERE inv.fboi_fbod_codigo = bod.fbod_codigo "
	query += " AND bod.fbod_codigo = " + strconv.Itoa(res.CodBodega)
	query += " AND bod.HDGCodigo = " + strconv.Itoa(res.PiHDGCodigo)
	query += " AND bod.ESACodigo = " + strconv.Itoa(res.PiESACodigo)
	query += " AND bod.CMECodigo = " + strconv.Itoa(res.PiCMECodigo)
	query += " AND inv.fboi_mein_id = med.mein_id"
	query += " AND inv.FBOI_BOD_CONTROLMINIMO = '" + res.ControlMinimo + "'"
	query += " ORDER BY med.mein_descri"

	ctx := context.Background()
	rows, err := db.QueryContext(ctx, query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query productos por bodega",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query productos por bodega",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	retornoValores := []models.ArticulosxBodega{}

	for rows.Next() {
		valores := models.ArticulosxBodega{}

		err := rows.Scan(
			&valores.FBoIDBodega,
			&valores.CodBodega,
			&valores.HDGCodigo,
			&valores.ESACodigo,
			&valores.CMECodigo,
			&valores.MeInIDProd,
			&valores.PuntoAsigna,
			&valores.PuntoReordena,
			&valores.StockCritico,
			&valores.StockActual,
			&valores.DesBodega,
			&valores.MeInCodProd,
			&valores.MeInDesProd,
			&valores.MeInTipoProd,
			&valores.MeInTipoMedi,
			&valores.MeInValCosto,
			&valores.MeInMargen,
			&valores.MeInValVenta,
			&valores.MeInCodUniCompra,
			&valores.MeInCodUniDespa,
			&valores.MeInIncobFonasa,
			&valores.MeInTipoIncob,
			&valores.MeInEstado,
			&valores.Campo1,
			&valores.NivelReposicion,
			&valores.ControlMinimo,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan productos por bodega",
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
