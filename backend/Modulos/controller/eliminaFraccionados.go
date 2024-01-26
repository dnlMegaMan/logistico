package controller

import (
	"encoding/json"
	ioutil "io"
	"net/http"

	"fmt"
	"strings"

	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"

	"sonda.com/logistico/Modulos/models"
)

// EliminaFraccionados is...
func EliminaFraccionados(w http.ResponseWriter, r *http.Request) {
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
	var msg models.PDatosParaEliminar
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

	res := models.PDatosParaEliminar{}
	json.Unmarshal([]byte(output), &res)

	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	var PiMeInIDOrig int
	var PiMeInIDDest int
	//  var PUsuario             string
	var PServidor string

	det := res.Detalle

	for i := range det {

		PiMeInIDOrig = det[i].MeInIDOrig
		PiMeInIDDest = det[i].MeInIDDest
		//     PUsuario     = res.PiUsuario
		PServidor = det[i].PiServidor

		db, _ := database.GetConnection(PServidor)

		_, err := db.Exec("Begin PCK_DISTRIB_COMPRA.P_CAMBIA_ESTADO(:pinCOD,:pinID);end;", PiMeInIDOrig, PiMeInIDDest)

		query := fmt.Sprintf("Begin PCK_DISTRIB_COMPRA.P_CAMBIA_ESTADO(%d, %d);end;", PiMeInIDOrig, PiMeInIDDest)

		logger.Trace(logs.InformacionLog{
			Query:   query,
			Mensaje: "Query package eliminar fraccionados",
		})

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   query,
				Mensaje: "Se cayo query package eliminar fraccionados",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}

	models.EnableCors(&w)

	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
