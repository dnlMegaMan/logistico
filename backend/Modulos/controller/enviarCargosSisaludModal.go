package controller

import (
	"encoding/json"
	ioutil "io"
	"net/http"
	"strings"

	"sonda.com/logistico/Modulos/models"
	logs "sonda.com/logistico/logging"
	// "fmt"
)

// EnviarCargosSisaludModal is...
func EnviarCargosSisaludModal(w http.ResponseWriter, r *http.Request) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	models.EnableCors(&w)
	w.Header().Set("Content-Type", "application/json")
	var Valor int
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
	var msg models.EnviarCargosSisaludModalParam
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
	models.EnableCors(&w)
	res := models.EnviarCargosSisaludModalParam{}
	json.Unmarshal([]byte(output), &res)
	models.EnableCors(&w)

	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	hdgcodigo := res.Division
	idMovimiento := res.IDMovimiento
	idDetalleMovimiento := res.IDDetalleMovimiento
	servidor := res.Servidor
	IDDevolucion := res.IDDevolucion

	Valor = EnviacargosSisalud(hdgcodigo, idMovimiento, idDetalleMovimiento, servidor, IDDevolucion)

	models.EnableCors(&w)
	json.NewEncoder(w).Encode(Valor)
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
