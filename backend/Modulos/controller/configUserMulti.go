package controller

import (
	"encoding/json"
	"io/ioutil"
	"net/http"
	"strconv"

	"sonda.com/logistico/Modulos/comun"
	"sonda.com/logistico/Modulos/models"
	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"
)

// ConfigUserMulti is...
func ConfigUserMulti(w http.ResponseWriter, r *http.Request) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	models.EnableCors(&w)
	w.Header().Set("Content-Type", "application/json")

	// Read body
	b, err := ioutil.ReadAll(r.Body)
	defer r.Body.Close()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		logger.Error(logs.InformacionLog{
			Mensaje: "Error al leer el cuerpo de la peticion",
			Error:   err,
		})
		return
	}

	// Unmarshal
	var valores models.RespConfigUserMulti
	retornoValores := []models.RespConfigUserMulti{}

	err = json.Unmarshal(b, &valores)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		logger.Error(logs.InformacionLog{
			Mensaje: "Error al hacer unmarshal del JSON de entrada",
			Error:   err,
		})
		return
	}

	// Respuesta HTTP
	db, _ := database.GetConnection(valores.Servidor)
	defer db.Close() // Asegurate de cerrar la conexion a la base de datos al final

	paramSelectIdioma := false
	valor, err := comun.ObtenerClinFarParamGeneral(db, "selectorIdioma")
	if err != nil {
		http.Error(w, "Error interno del servidor", http.StatusInternalServerError)
		logger.Error(logs.InformacionLog{
			Mensaje: "Error al obtener el valor del parametro",
			Error:   err,
		})
		return
	}

	if valor == "SI" {
		paramSelectIdioma = true
	}

	logger.Info(logs.InformacionLog{JSONEntrada: nil, Mensaje: "paramSelectIdioma: " + strconv.FormatBool(paramSelectIdioma)})

	valores.ParamSelectIdioma = paramSelectIdioma
	retornoValores = append(retornoValores, valores)

	json.NewEncoder(w).Encode(retornoValores)

	models.EnableCors(&w)

	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
