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

// ProdaDistribuir is...
func ProdaDistribuir(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ParametrosProdDistr
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

	res := models.ParametrosProdDistr{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.PiUsuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	PiMeInCod := res.PaMeInCod
	PiMeInDes := res.PaMeInDes
	PiHDGCodigo := res.PaHDGCodigo

	db, _ := database.GetConnection(res.PiServidor)

	var query string
	if PiMeInCod != "" {
		query = "SELECT MAM.HDGCodigo, MAM.ESACodigo, MAM.CMECodigo, trim(MAM.MEIN_CODMEI), trim(MAM.MEIN_DESCRI), INV.FBOI_STOCK_ACTUAL, MAM.MEIN_ID, '' Campo FROM CLIN_FAR_MAMEIN MAM, CLIN_FAR_BODEGAS_INV INV WHERE MAM.MEIN_ID=INV.FBOI_MEIN_ID AND mam.hdgcodigo = " + strconv.Itoa(PiHDGCodigo) + " AND TRIM(MAM.MEIN_CODMEI)= '" + PiMeInCod + "' AND INV.FBOI_FBOD_CODIGO = 1 AND MAM.MEIN_PROD_SOLO_COMPRAS = 'S' ORDER BY MAM.MEIN_DESCRI"
	}

	if PiMeInDes != "" {
		query = "SELECT MAM.HDGCodigo, MAM.ESACodigo, MAM.CMECodigo, trim(MAM.MEIN_CODMEI), trim(MAM.MEIN_DESCRI), INV.FBOI_STOCK_ACTUAL, MAM.MEIN_ID, '' Campo FROM CLIN_FAR_MAMEIN MAM, CLIN_FAR_BODEGAS_INV INV WHERE MAM.MEIN_ID=INV.FBOI_MEIN_ID AND mam.hdgcodigo = " + strconv.Itoa(PiHDGCodigo) + " AND MAM.MEIN_DESCRI like '" + PiMeInDes + "%' AND INV.FBOI_FBOD_CODIGO = 1 AND MAM.MEIN_PROD_SOLO_COMPRAS = 'S' ORDER BY MAM.MEIN_DESCRI"
	}

	ctx := context.Background()
	rows, err := db.QueryContext(ctx, query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query proda distribuir",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query proda distribuir",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	retornoValores := []models.ProductosParaDis{}
	for rows.Next() {
		valores := models.ProductosParaDis{}

		err := rows.Scan(
			&valores.HDGCodigo,
			&valores.ESACodigo,
			&valores.CMECodigo,
			&valores.MeInCodMeI,
			&valores.MeInDescri,
			&valores.StockActual,
			&valores.MeInID,
			&valores.Campo,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan proda distribuir",
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
