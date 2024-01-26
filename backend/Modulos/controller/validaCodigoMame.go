package controller

import (
	"context"
	"encoding/json"
	ioutil "io"
	"net/http"
	"strconv"
	"strings"

	"sonda.com/logistico/Modulos/models"
	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"
)

// ValidaCodigoMame is...
func ValidaCodigoMame(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ParaValidaCod
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

	res := models.ParaValidaCod{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.PiUsuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	PiCodigoMein := res.CodigoMein
	PiBodegaCodigo := res.BodegaCodigo

	db, _ := database.GetConnection(res.PiServidor)

	var query string
	if PiCodigoMein != " " && PiBodegaCodigo != 0 {
		query = "SELECT B.FBOI_ID, B.FBOI_FBOD_CODIGO, B.FBOI_MEIN_ID, B.FBOI_PUNASI, B.FBOI_PUNREO, B.FBOI_STOCRI, B.FBOI_STOCK_ACTUAL, M.MEIN_DESCRI, M.MEIN_CODMEI, '' Campo FROM CLIN_FAR_BODEGAS_INV B, CLIN_FAR_MAMEIN M WHERE M.MEIN_CODMEI = '" + PiCodigoMein + "' AND B.FBOI_MEIN_ID = M.MEIN_ID AND B.FBOI_FBOD_CODIGO=" + strconv.Itoa(PiBodegaCodigo)
	}

	ctx := context.Background()
	rows, err := db.QueryContext(ctx, query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query valida codigo mamein",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query valida codigo mamein",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	retornoValores := []models.ValidaCodigoMaMe{}
	for rows.Next() {
		valores := models.ValidaCodigoMaMe{}

		err := rows.Scan(
			&valores.BodegaInvID,
			&valores.BodegaCodigo,
			&valores.MeInID,
			&valores.PuntoAsignacion,
			&valores.PuntoReordena,
			&valores.StockCritico,
			&valores.StockActual,
			&valores.DescripcionMeIn,
			&valores.CodigoMein,
			&valores.Campo,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan valida codigo mamein",
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
