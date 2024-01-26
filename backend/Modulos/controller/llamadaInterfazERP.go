package controller

import (
	"bytes"
	"net/http"

	"strconv"

	logs "sonda.com/logistico/logging"
)

// LlamadaInterfazERP is...
func LlamadaInterfazERP(inHdgcodigo int, inTipo int, inIDagrupador int, inNumeromovimiento int, inSoliid int, inServidor string, inUsuario string, inSobreGiro bool) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	logger.Info(logs.InformacionLog{
		Mensaje: "Parametros de entrada",
		Contexto: map[string]interface{}{
			"inHdgcodigo":        inHdgcodigo,
			"inTipo":             inTipo,
			"inIDagrupador":      inIDagrupador,
			"inNumeromovimiento": inNumeromovimiento,
			"inSoliid":           inSoliid,
			"inServidor":         inServidor,
			"inUsuario":          inUsuario,
			"inSobreGiro":        inSobreGiro,
		},
	})
	// log.Printf("Entro a LlamadaInterfazERP ...")
	// Establecer parametros de URL en la declaracion
	// db, _ := database.GetConnection(inServidor)
	// query := " SELECT PARG_VALOR1 FROM CLIN_FAR_PARAM_GENERAL WHERE PARG_CODIGO = '2' "
	// ctx := context.Background()
	// rows, err := db.QueryContext(ctx, query)

	// if err != nil {
	// 	log.Println("Error select Bodegas (LlamadaInterfazERP): ", query)
	// 	log.Println(err, rows)
	// 	// http.Error(w, err.Error(), 200)
	// }

	// defer rows.Close()

	var URL string
	URL = "http://localhost:8091/enviarmovimientosFin700Masivo"
	// for rows.Next() {

	// 	err := rows.Scan(&URL)
	// 	if err != nil {
	// 		// http.Error(w, err.Error(), 200)
	// 		return
	// 	}
	// }

	s := "{\"hdgcodigo\":" + strconv.Itoa(inHdgcodigo) + ",\"servidor\":\"" + inServidor + ",\"usuario\":\"" + inUsuario + "\",\"tipomovimiento\":" + strconv.Itoa(inTipo)
	s = s + ",\"numeromovimiento\":" + strconv.Itoa(inNumeromovimiento) + ",\"soliid\":" + strconv.Itoa(inSoliid)
	s = s + ",\"idagrupador\":" + strconv.Itoa(inIDagrupador) + ",\"sobregiro\":" + strconv.FormatBool(inSobreGiro) + "}"
	var jsonStr = []byte(s)

	req, err := http.NewRequest("POST", URL, bytes.NewBuffer(jsonStr))
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "Error crear request llamada interfaz ERP",
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
			Mensaje: "Error realizar llamada interfaz ERP",
			Error:   err,
		})
		return
	}
	defer resp.Body.Close()

	// log.Println("response Status:", resp.Status)
	// log.Println("response Headers:", resp.Header)
	// body, _ := ioutil.ReadAll(resp.Body)
	// log.Println("response Body:", string(body))
	logger.LoguearSalida()
}
