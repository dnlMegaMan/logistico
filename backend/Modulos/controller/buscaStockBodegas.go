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

// BuscaStockBodegas is...
func BuscaStockBodegas(w http.ResponseWriter, r *http.Request) {
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
	var msg models.BuscaStockBodegasParam
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

	res := models.BuscaStockBodegasParam{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.Usuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	models.EnableCors(&w)

	db, _ := database.GetConnection(res.Servidor)

	query := "SELECT "
	query += "   NVL(FBOI_FBOD_CODIGO , 0) AS CodigoBodega "
	query += " , NVL((SELECT FBOD_DESCRIPCION FROM CLIN_FAR_BODEGAS WHERE FBOD_CODIGO = FBOI_FBOD_CODIGO), ' ') AS NombreBodega "
	query += " , NVL(FBOI_STOCK_ACTUAL, 0) AS SaldoBodega "
	query += " FROM CLIN_FAR_BODEGAS_INV "
	query += " WHERE "
	query += " FBOI_FBOD_CODIGO IN ("
	query += "    select FBOD_CODIGO "
	query += "    from clin_far_bodegas "
	query += "    WHERE HDGCODIGO = " + strconv.Itoa(res.HDGCodigo)
	query += "    AND ESACODIGO = " + strconv.Itoa(res.ESACodigo)
	query += "    AND CMECODIGO = " + strconv.Itoa(res.CMECodigo)
	query += "    AND FBOD_TIPO_BODEGA != 'G' "
	query += "    ) "
	query += " AND FBOI_FBOD_CODIGO  > 0 "
	// query += " AND FBOI_STOCK_ACTUAL > 0 "
	if res.MeinID != 0 {
		query += "     AND FBOI_MEIN_ID = " + strconv.Itoa(res.MeinID)
	}

	query += " ORDER BY 1"

	ctx := context.Background()
	rows, err := db.QueryContext(ctx, query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query busca stock bodegas",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query busca stock bodegas",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	retornoValores := []models.BuscaStockBodegasReturn{}
	for rows.Next() {
		valores := models.BuscaStockBodegasReturn{}

		err := rows.Scan(
			&valores.CodigoBodega,
			&valores.NombreBodega,
			&valores.SaldoBodega,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan busca stock bodegas",
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
