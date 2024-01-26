package controller

import (
	"bytes"
	"context"
	ioutil "io"
	"net/http"

	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"
)

// LlamadaGeneraToken is...
func LlamadaGeneraToken(inName string, inPassword string, inRole string, inServidor string) (value string, err error) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	// Establecer parametros de URL en la declaracion

	db, _ := database.GetConnection(inServidor)
	query := "SELECT PARG_VALOR1 FROM CLIN_FAR_PARAM_GENERAL WHERE PARG_CODIGO = '5'"
	ctx := context.Background()
	rows, err := db.QueryContext(ctx, query)

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query en llamada genera token",
			Error:   err,
		})
		return "", err
	}

	defer rows.Close()

	var URL string

	for rows.Next() {

		err := rows.Scan(&URL)
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan en llamada genera token",
				Error:   err,
			})
			return "", err
		}
	}

	s := "{\"name\": \"" + inName + "\", \"password\": \"\", \"role\": \"" + inRole + "\"}"

	var jsonStr = []byte(s)

	req, err := http.NewRequest("POST", URL, bytes.NewBuffer(jsonStr))
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "Se cayo creacion de request",
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
			Mensaje: "Se cayo llamada genera token",
			Error:   err,
		})
		return "", err
	}
	defer resp.Body.Close()

	//log.Println("response Status:", resp.Status)
	//log.Println("response Headers:", resp.Header)
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "Se cayo lectura de respuesta llamada genera token",
			Error:   err,
		})
		return "", err
	}
	value = string(body)

	//log.Println("response Body:", string(body))
	logger.LoguearSalida()

	return value, nil
}
