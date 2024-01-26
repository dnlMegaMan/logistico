package controller

import (
	"encoding/json"
	"net/http"
	"strconv"

	"strings"

	logs "sonda.com/logistico/logging"

	"sonda.com/logistico/Modulos/comun"
	"sonda.com/logistico/Modulos/models"
)

// Obtiene configuraciones generales para el logistico, es decir, que aplican
// a todos los usuarios. Este endpoint debe ser llamado solo si el usuario esta
// logueado.
func Configuracionlogistico(w http.ResponseWriter, r *http.Request) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	models.EnableCors(&w)
	w.Header().Set("Content-Type", "application/json")

	// UNMARSHAL
	res := models.ConfiguracionLogisticoRequest{}
	err := json.NewDecoder(r.Body).Decode(&res)
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

	logger.SetUsuario(res.Usuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	// OBTENER CONFIGURACION
	params, err := comun.ObtenerClinFarParamGeneralMultiple(
		logger,
		res.Servidor,
		[]string{
			"rangoFechaSoli",
			"tpoExpSesion",
		},
	)

	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "Fallo obtencion de parametros generales",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// ARMAR CONFIGURACION
	configLogistico := models.ConfiguracionLogisticoResponse{}
	configLogistico.RangoFechasSolicitudes, err = strconv.Atoi(params["rangoFechaSoli"].Valor1)
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "No puede convertir rango de fechas",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	tiempoExpiraSesionSegundos, err := strconv.Atoi(params["tpoExpSesion"].Valor1)
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "No puede convertir tiempo de bloqueo de pantalla",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	configLogistico.TiempoExpiraSesionMs = tiempoExpiraSesionSegundos * 1000

	// OK
	json.NewEncoder(w).Encode(configLogistico)

	logger.LoguearSalida()
}
