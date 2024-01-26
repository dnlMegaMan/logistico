package controller

import (
	"bytes"
	"context"
	"encoding/json"
	ioutil "io"
	"net/http"
	"strconv"

	database "sonda.com/logistico/pkg_conexion"

	"sonda.com/logistico/Modulos/models"
	logs "sonda.com/logistico/logging"
)

// LlamadaWSLogIntegraPedidoERP is...
func LlamadaWSLogIntegraPedidoERP(inHdgCodigo int, inServidor string, inIDSolicitud int, tipo string) (string, error) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	logger.Info(logs.InformacionLog{
		Mensaje: "Parametros de entrada",
		Contexto: map[string]interface{}{
			"inHdgCodigo": inHdgCodigo, "inServidor": inServidor, "inIDSolicitud": inIDSolicitud, "tipo": tipo,
		},
	})

	// Establecer parametros de URL en la declaracion
	db, _ := database.GetConnection(inServidor)
	query := "SELECT PARG_VALOR1 FROM CLIN_FAR_PARAM_GENERAL WHERE PARG_CODIGO = '4'"
	ctx := context.Background()
	rows, err := db.QueryContext(ctx, query)

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query busca param general ",
			Error:   err,
		})
		return "", err
	}

	defer rows.Close()

	var URL string
	// URL := "http://localhost:8091/wsLogIntegraPedido"
	for rows.Next() {

		err := rows.Scan(&URL)
		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   query,
				Mensaje: "Se cayo query busca param general",
				Error:   err,
			})
			return "", err
		}
	}

	s := "{\"hdgcodigo\":" + strconv.Itoa(inHdgCodigo) + ",\"servidor\":\"" + inServidor + "\",\"idsolicitud\":" + strconv.Itoa(inIDSolicitud) + ",\"tipo\":\"" + tipo + "\" }"

	var jsonStr = []byte(s)

	req, err := http.NewRequest("POST", URL, bytes.NewBuffer(jsonStr))
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "Se cayo creacion de request llamada WS log integra pedido ERP",
			Error:   err,
		})
		return "", err
	}
	req.Header.Set("X-Custom-Header", "myvalue")
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "Se cayo envio de request llamada WS log integra pedido ERP",
			Error:   err,
		})
		return "", err
	}
	defer resp.Body.Close()

	body, _ := ioutil.ReadAll(resp.Body)

	rsp := []byte("`" + string(body) + "`")
	var valor models.RespuestaPedidoERP
	json.Unmarshal(rsp, &valor)
	return valor.Respuesta, nil
}
