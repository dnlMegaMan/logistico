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

// NuevosProductoUnitario is...
func NuevosProductoUnitario(w http.ResponseWriter, r *http.Request) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	models.EnableCors(&w)

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
	var msg models.ParametrosNuevosCods
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

	res := models.ParametrosNuevosCods{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.PiUsuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	w.Header().Set("Content-Type", "application/json")

	db, _ := database.GetConnection(res.PiServidor)

	query := "SELECT trim(CFM.MEIN_CODMEI) CODIGO, trim(CFM.MEIN_DESCRI) DESCRIPCION, BINV.FBOI_STOCK_ACTUAL STOCK, FBOI_FBOD_CODIGO ID_BODEGA, CFM.MEIN_ID ID, '' Campo FROM CLIN_FAR_MAMEIN CFM, CLIN_FAR_BODEGAS_INV BINV WHERE CFM.hdgcodigo = " + strconv.Itoa(res.PaHDGCodigo) + " And CFM.MEIN_PROD_SOLO_COMPRAS IS NULL AND BINV.FBOI_MEIN_ID = CFM.MEIN_ID AND BINV.FBOI_FBOD_CODIGO = 1 ORDER BY CFM.MEIN_DESCRI"
	ctx := context.Background()
	rows, err := db.QueryContext(ctx, query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query nuevos producto unitario",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query nuevos producto unitario",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	retornoValores := []models.NewDetalleFraccion{}
	for rows.Next() {
		valores := models.NewDetalleFraccion{}

		err := rows.Scan(
			&valores.NPdMeInCod,
			&valores.NPdMeInDes,
			&valores.NPdStockAc,
			&valores.NPBodegaID,
			&valores.NPdMeInID,
			&valores.NCampo,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan nuevos producto unitario",
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
