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

// TipoPedidoPlantillaBodega is...
func TipoPedidoPlantillaBodega(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ParamServidor
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

	res := models.ParamServidor{}
	json.Unmarshal([]byte(output), &res)

	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	db, _ := database.GetConnection(res.PiServidorBD)

	query := "SELECT fpar_codigo, fpar_descripcion FROM clin_far_param"
	query += " WHERE fpar_tipo = 84"
	query += " and fpar_codigo > 0"
	query += " AND FPAR_HDGCODIGO= " + strconv.Itoa(res.HDGCodigo)
	query += " AND FPAR_ESACODIGO= " + strconv.Itoa(res.ESACodigo)
	query += " AND FPAR_CMECODIGO= " + strconv.Itoa(res.CMECodigo)

	ctx := context.Background()
	rowsQ, err := db.QueryContext(ctx, query)

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query tipo pedido plantillas bodegas",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rowsQ.Close()

	models.EnableCors(&w)

	retornoValores := []models.TipoPedidoPlantillaBodegaResp{}
	for rowsQ.Next() {
		valores := models.TipoPedidoPlantillaBodegaResp{}

		err := rowsQ.Scan(
			&valores.CodTipoPedido,
			&valores.DesTipoPedido,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan tipo pedido plantillas bodegas",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		retornoValores = append(retornoValores, valores)
	}

	json.NewEncoder(w).Encode(retornoValores)
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
