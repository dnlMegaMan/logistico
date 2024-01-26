package controller

import (
	"bytes"
	"context"
	"encoding/xml"
	ioutil "io"
	"net/http"
	"strconv"

	"sonda.com/logistico/Modulos/models"
	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"
)

// WmConsultaSaldo is...
func WmConsultaSaldo(Empresa string, Division string, Bodega string, Producto string, IndicadorSaldo int, Servidor string) (models.ResultWmConsultaSaldo, error) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	var (
		mensageAux models.ResultWmConsultaSaldo
		xmlLlamada models.WmConsultaSaldoEnvelope
		myEnv      models.WmConsultaSaldoRespEnvelope
	)

	db, _ := database.GetConnection(Servidor)

	var URL string // "http://10.211.30.25/fin700testws/wsLogIntegraConsulta/wsLogIntegraConsulta.asmx?WSDL"
	queryURL := " SELECT FPAR_VALOR FROM CLIN_FAR_PARAM WHERE FPAR_TIPO = 80 AND FPAR_CODIGO = 4 AND FPAR_ESTADO = 0 "
	ctxURL := context.Background()
	rowsURL, errURL := db.QueryContext(ctxURL, queryURL)

	if errURL != nil {
		logger.Error(logs.InformacionLog{
			Query:   queryURL,
			Mensaje: "Se cayo query obtener URL WS consulta saldo",
			Error:   errURL,
		})
		return models.ResultWmConsultaSaldo{}, errURL
	}
	defer rowsURL.Close()

	if rowsURL != nil {
		for rowsURL.Next() {
			errURL := rowsURL.Scan(&URL)
			if errURL != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo scan obtener URL WS consulta saldo",
					Error:   errURL,
				})
				mensageAux.Empresa = " "
				mensageAux.Division = " "
				mensageAux.Bodega = " "
				mensageAux.Producto = " "
				mensageAux.Cantidad = " "
				mensageAux.Valor = " "
				mensageAux.CostoMedio = " "
				return models.ResultWmConsultaSaldo{}, errURL
			}
		}
	}

	BodegaFin700 := "0"
	queryURL = " SELECT FBO_CODIGOBODEGA FROM CLIN_FAR_BODEGAS WHERE ESACODIGO = " + Empresa + " AND FBOD_CODIGO = " + Bodega
	ctxURL = context.Background()
	rowsURL, errURL = db.QueryContext(ctxURL, queryURL)

	logger.Trace(logs.InformacionLog{
		Query:   queryURL,
		Mensaje: "Query obtener codigo de bodega",
	})

	if errURL != nil {
		logger.Error(logs.InformacionLog{
			Query:   queryURL,
			Mensaje: "Se cayo query obtener codigo de bodega",
			Error:   errURL,
		})
		return models.ResultWmConsultaSaldo{}, errURL
	}
	defer rowsURL.Close()

	if rowsURL != nil {
		for rowsURL.Next() {
			errURL := rowsURL.Scan(&BodegaFin700)

			if errURL != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo scan obtener codigo de bodega",
					Error:   errURL,
				})
				mensageAux.Empresa = " "
				mensageAux.Division = " "
				mensageAux.Bodega = " "
				mensageAux.Producto = " "
				mensageAux.Cantidad = " "
				mensageAux.Valor = " "
				mensageAux.CostoMedio = " "
				return models.ResultWmConsultaSaldo{}, errURL
			}
		}
	}

	xmlLlamada.Body.GetResponseBody.GetResponse.Empresa = Empresa
	xmlLlamada.Body.GetResponseBody.GetResponse.Division = Division
	xmlLlamada.Body.GetResponseBody.GetResponse.Bodega = BodegaFin700
	xmlLlamada.Body.GetResponseBody.GetResponse.Producto = Producto
	xmlLlamada.Body.GetResponseBody.GetResponse.IndicadorSaldo = strconv.Itoa(IndicadorSaldo)

	client := &http.Client{}

	j, _ := xml.Marshal(xmlLlamada)

	logger.Trace(logs.InformacionLog{
		Mensaje:  "Body XML",
		Contexto: map[string]interface{}{"xml": string(j)},
	})

	req, err := http.NewRequest(MethodPost, URL, bytes.NewBuffer(j))
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "Fallo creacion de request",
			Error:   err,
		})
		return models.ResultWmConsultaSaldo{}, err
	}

	req.Header.Add("Content-Type", "text/xml; charset=utf-8")

	resXML, err := client.Do(req)
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "Fallo envio de request",
			Error:   err,
		})
		return models.ResultWmConsultaSaldo{}, err
	}
	defer resXML.Body.Close()

	bodyRetornado, err := ioutil.ReadAll(resXML.Body)
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "Fallo lectura del body del request",
			Error:   err,
		})
		return models.ResultWmConsultaSaldo{}, err
	}

	err = xml.Unmarshal(bodyRetornado, &myEnv)
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "Fallo unmarshall del body retornado",
			Error:   err,
		})
		return models.ResultWmConsultaSaldo{}, err
	}

	logger.Trace(logs.InformacionLog{
		Mensaje:  "Body bodyRetornado",
		Contexto: map[string]interface{}{"xml": string(bodyRetornado)},
	})

	resultado := myEnv.Body.GetResponse.GetResult

	mensageAux.Empresa = resultado.GetDetalleSalida.GetSalida.Empresa
	mensageAux.Division = resultado.GetDetalleSalida.GetSalida.Division
	mensageAux.Bodega = resultado.GetDetalleSalida.GetSalida.Bodega
	mensageAux.Producto = resultado.GetDetalleSalida.GetSalida.Producto
	mensageAux.Cantidad = resultado.GetDetalleSalida.GetSalida.Cantidad
	mensageAux.Valor = resultado.GetDetalleSalida.GetSalida.Valor
	mensageAux.CostoMedio = resultado.GetDetalleSalida.GetSalida.CostoMedio

	return mensageAux, nil
}
