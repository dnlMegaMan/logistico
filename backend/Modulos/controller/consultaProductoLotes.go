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

// Busca los productos que tienen lotes asociados
func ConsultaProductoLotes(w http.ResponseWriter, r *http.Request) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	models.EnableCors(&w)
	w.Header().Set("Content-Type", "application/json")

	// Unmarshal
	res := models.ConsultaProductoLotesParam{}
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
	query += "     clin_far_lotes.lote, "
	query += "     clin_far_lotes.fecha_vencimiento, "
	query += "     mein_id, "
	query += "     mein_codmei, "
	query += "     mein_descri "
	query += " FROM "
	query += "          clin_far_lotes "
	query += "     INNER JOIN clin_far_mamein ON clin_far_lotes.id_producto = clin_far_mamein.mein_id "
	query += "     INNER JOIN clin_far_bodegas ON clin_far_lotes.id_bodega = clin_far_bodegas.fbod_codigo "
	query += " WHERE "
	query += "         clin_far_lotes.hdgcodigo = " + strconv.Itoa(res.HDGCodigo)
	query += "     AND clin_far_lotes.esacodigo = " + strconv.Itoa(res.ESACodigo)
	query += "     AND clin_far_lotes.cmecodigo = " + strconv.Itoa(res.CMECodigo)
	query += "     AND fbod_tipo_bodega <> 'G' "

	if strings.TrimSpace(res.Lote) != "" {
		query += " AND upper(clin_far_lotes.lote) LIKE upper('%" + strings.TrimSpace(res.Lote) + "%') "
	}

	if strings.TrimSpace(res.Codigo) != "" {
		query += " AND mein_codmei = '" + strings.TrimSpace(res.Codigo) + "' "
	}

	if strings.TrimSpace(res.Descripcion) != "" {
		query += " AND upper(mein_descri) LIKE upper('%" + strings.TrimSpace(res.Descripcion) + "%') "
	}

	query += " ORDER BY "
	query += "     mein_descri "

	db, _ := database.GetConnection(res.Servidor)
	rows, err := db.QueryContext(context.Background(), query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query consulta producto con lotes asociados",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query consulta producto con lotes asociados",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	productos := []models.ProductoConLote{}
	for rows.Next() {
		producto := models.ProductoConLote{}

		err = rows.Scan(
			&producto.Lote,
			&producto.FechaVencimiento,
			&producto.ProductoId,
			&producto.Codigo,
			&producto.Descripcion,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan consulta producto con lotes asociados",
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
