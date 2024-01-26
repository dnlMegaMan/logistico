package controller

import (
	"bytes"
	"context"
	ioutil "io"
	"net/http"
	"strconv"

	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"
)

// LlamadaInterfazDespachoRecetaLegado is...
func LlamadaInterfazDespachoRecetaLegado(inHdgcodigo int, inServidor string, inReceid int, inEstado int) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	logger.Info(logs.InformacionLog{
		Mensaje: "Parametros de entrada",
		Contexto: map[string]interface{}{
			"inHdgcodigo": inHdgcodigo, "inServidor": inServidor,
			"inReceid": inReceid, "inEstado": inEstado,
		},
	})

	// Establecer parametros de URL en la declaracion
	db, _ := database.GetConnection(inServidor)
	query := "SELECT PARG_VALOR1 FROM CLIN_FAR_PARAM_GENERAL WHERE PARG_CODIGO = '3'"
	ctx := context.Background()
	rows, err := db.QueryContext(ctx, query)

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query busca param general",
			Error:   err,
		})
		return
	}

	defer rows.Close()

	var URL string
	// URL := "http://localhost:8091/dispensacionRecetalegado"
	for rows.Next() {

		err := rows.Scan(&URL)
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan busca param general",
				Error:   err,
			})
			return
		}
	}

	s := "{\"hdgcodigo\":" + strconv.Itoa(inHdgcodigo) + ",\"servidor\":\"" + inServidor + "\",\"receid\":" + strconv.Itoa(inReceid) + ",\"estado\":" + strconv.Itoa(inEstado) + "}"

	var jsonStr = []byte(s)

	req, err := http.NewRequest("POST", URL, bytes.NewBuffer(jsonStr))
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "Se cayo creacion de request de llamada interfaz despacho receta legado",
			Error:   err,
		})
		return
	}
	req.Header.Set("X-Custom-Header", "myvalue")
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "Se cayo request de llamada interfaz despacho receta legado",
			Error:   err,
		})
		return
	}
	defer resp.Body.Close()

	body, _ := ioutil.ReadAll(resp.Body)
	logger.Info(logs.InformacionLog{
		Mensaje: "Respuesta envio de llamada interfaz despacho receta legado",
		Contexto: map[string]interface{}{
			"responseStatus":  resp.Status,
			"responseHeaders": resp.Header,
			"response":        string(body),
		},
	})

	logger.LoguearSalida()
}
