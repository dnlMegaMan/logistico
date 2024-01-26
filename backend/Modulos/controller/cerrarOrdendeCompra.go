package controller

import (
	"encoding/json"
	"fmt"
	ioutil "io"
	"net/http"
	"strings"

	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"

	"sonda.com/logistico/Modulos/models"
)

// CerrarOrdendeCompra is...
func CerrarOrdendeCompra(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ParametrosBuscaOC
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
	w.Header().Set("Content-Type", "application/json")
	w.Write(output)

	res := models.ParametrosBuscaOC{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.PiUsuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	NumOC := res.PinumOC
	PiHDGCod := res.PiHDGCodigo
	PiESACod := res.PiESACodigo
	PiCMECod := res.PiCMECodigo

	//Conecta a BD Oracle
	db, _ := database.GetConnection(res.PiServidor)

	_, err = db.Exec("Update Clin_far_oc SET ORCO_ESTADO = 6, ORCO_FECHA_CIERRE = SYSDATE where ORCO_NUMDOC = :NumOC and HDGCodigo = :PiHDGCod and ESACodigo = :PiESACod and CMECodigo = :PiCMECod", NumOC, PiHDGCod, PiESACod, PiCMECod)

	query := fmt.Sprintf("Update Clin_far_oc SET ORCO_ESTADO = 6, ORCO_FECHA_CIERRE = SYSDATE where ORCO_NUMDOC = %d and HDGCodigo = %d and ESACodigo = %d and CMECodigo = %d", NumOC, PiHDGCod, PiESACod, PiCMECod)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query cerrar orden de compra",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:    query,
			Mensaje:  "Se cayo query cerrar orden de compra",
			Error:    err,
			Contexto: map[string]interface{}{"ordenDeCompra": NumOC},
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	logger.LoguearSalida()
}
