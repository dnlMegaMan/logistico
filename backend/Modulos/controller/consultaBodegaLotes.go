package controller

import (
	"context"
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"

	"sonda.com/logistico/Modulos/models"
)

// Busca las bodegas en las que se encuentra un producto y los lotes asociados
// a este.
func ConsultaBodegaLotes(w http.ResponseWriter, r *http.Request) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	models.EnableCors(&w)
	w.Header().Set("Content-Type", "application/json")

	// Unmarshal
	res := models.ConsultaBodegaLotesParam{}
	err := json.NewDecoder(r.Body).Decode(&res)
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

	logger.SetUsuario(res.Usuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	// Ejecutar query
	query := " SELECT DISTINCT "
	query += "    fbod_codigo, "
	query += "    fbod_descripcion, "
	query += "    clin_far_lotes.saldo "
	query += " FROM "
	query += "          clin_far_lotes "
	query += "     INNER JOIN clin_far_mamein ON clin_far_lotes.id_producto = clin_far_mamein.mein_id "
	query += "     INNER JOIN clin_far_bodegas ON clin_far_lotes.id_bodega = clin_far_bodegas.fbod_codigo "
	query += " WHERE "
	query += "         clin_far_lotes.hdgcodigo = " + strconv.Itoa(res.HDGCodigo)
	query += "     AND clin_far_lotes.esacodigo = " + strconv.Itoa(res.ESACodigo)
	query += "     AND clin_far_lotes.cmecodigo = " + strconv.Itoa(res.CMECodigo)
	query += "     AND fbod_tipo_bodega <> 'G' "
	query += "     AND clin_far_lotes.lote = '" + res.Lote + "' "
	query += "     AND mein_codmei = '" + res.CodigoProducto + "' "
	query += " ORDER BY "
	query += "     fbod_descripcion "

	db, _ := database.GetConnection(res.Servidor)
	rows, err := db.QueryContext(context.Background(), query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query consulta saldo lotes por bodega",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query consulta saldo lotes por bodega",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	productos := []models.BodegaConLote{}
	for rows.Next() {
		producto := models.BodegaConLote{}

		err = rows.Scan(
			&producto.Codigo,
			&producto.Descripcion,
			&producto.Saldo,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan consulta saldo lotes por bodega",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		productos = append(productos, producto)
	}

	json.NewEncoder(w).Encode(productos)

	logger.LoguearSalida()
}
