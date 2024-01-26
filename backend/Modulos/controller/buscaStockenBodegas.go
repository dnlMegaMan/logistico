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

// BuscaStockenBodegas is...
func BuscaStockenBodegas(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ParamBuscaStockxBod
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

	res := models.ParamBuscaStockxBod{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.PiUsuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	PiBodegaCodigo := res.BodegaCodigo
	PiProductoDesc := res.ProductoDesc
	PiProductoCodi := res.ProductoCodi

	db, _ := database.GetConnection(res.PiServidor)

	var query string
	if PiProductoDesc == "" && PiProductoCodi == "" {
		query = "SELECT fboi_fbod_codigo, fboi_mein_id, mein_codmei, trim(mein_descri), mein_tiporeg, fboi_stock_actual FROM CLIN_FAR_BODEGAS_INV, CLIN_FAR_MAMEIN WHERE fboi_fbod_codigo = " + strconv.Itoa(PiBodegaCodigo) + " AND fboi_mein_id = mein_id ORDER BY mein_codmei"
	}

	if PiProductoDesc == "" && PiProductoCodi != "" {
		query = "SELECT fboi_fbod_codigo, fboi_mein_id, mein_codmei, trim(mein_descri), mein_tiporeg, fboi_stock_actual FROM CLIN_FAR_BODEGAS_INV, CLIN_FAR_MAMEIN WHERE fboi_fbod_codigo = " + strconv.Itoa(PiBodegaCodigo) + " AND fboi_mein_id = mein_id AND TRIM(mein_codmei) like '" + PiProductoCodi + "%' ORDER BY mein_codmei"
	}

	if PiProductoCodi == "" && PiProductoDesc != "" {
		query = "SELECT fboi_fbod_codigo, fboi_mein_id, mein_codmei, trim(mein_descri), mein_tiporeg, fboi_stock_actual FROM CLIN_FAR_BODEGAS_INV, CLIN_FAR_MAMEIN WHERE fboi_fbod_codigo = " + strconv.Itoa(PiBodegaCodigo) + " AND fboi_mein_id = mein_id AND TRIM(mein_descri) like '" + PiProductoDesc + "%' ORDER BY mein_codmei"
	}

	ctx := context.Background()
	rows, err := db.QueryContext(ctx, query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query busca stock en bodegas",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query busca stock en bodegas",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	retornoValores := []models.ProductosEnBodega{}
	for rows.Next() {
		valores := models.ProductosEnBodega{}

		err := rows.Scan(
			&valores.BodegaCodigo,
			&valores.IDMeIn,
			&valores.ProductoCodi,
			&valores.ProductoDesc,
			&valores.ProductoTipo,
			&valores.BodegaStock,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan busca stock en bodegas",
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
