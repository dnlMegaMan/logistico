package controller

import (
	"encoding/json"
	ioutil "io"
	"net/http"
	"strings"

	"sonda.com/logistico/Modulos/models"
	logs "sonda.com/logistico/logging"
)

// ValidaBodega is...
func ValidaBodega(w http.ResponseWriter, r *http.Request) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	models.EnableCors(&w)

	w.Header().Set("Content-Type", "application/json")

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
	var msg models.ParamValidaBodega
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

	res := models.ParamValidaBodega{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.PiUsuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	PiHDGCod := res.PiHDGCodigo
	PiESACod := res.PiESACodigo
	PiCMECod := res.PiCMECodigo
	PiCodBod := res.CodBodega
	PServidor := res.PiServidor

	PiCodBod, PoDesBod, PoExiste, PoCodestbod, PoDesestbod, err := BuscaBodega(PiCodBod, PiHDGCod, PiESACod, PiCMECod, PServidor)
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "Se cayo funcion BuscaBodega",
			Error:   err,
			Contexto: map[string]interface{}{
				"PiCodBod": PiCodBod, "PiHDGCod": PiHDGCod, "PiESACod": PiESACod,
				"PiCMECod": PiCMECod, "PServidor": PServidor,
			},
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	PoCodSer, PoDesSer, err := ServicioAsocBodega(PiCodBod, PiHDGCod, PiESACod, PiCMECod, PServidor)
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "Se cayo ServicioAsocBodega",
			Error:   err,
			Contexto: map[string]interface{}{
				"PiCodBod": PiCodBod, "PiHDGCod": PiHDGCod, "PiESACod": PiESACod,
				"PiCMECod": PiCMECod, "PServidor": PServidor,
			},
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	PoRetorno := ""
	if PoExiste == 0 {
		PoRetorno = "N"
	}
	if PoExiste == 1 {
		PoRetorno = "S"
	}

	valores := models.ValidaBodega{
		CodBodega:     PiCodBod,
		DesBodega:     PoDesBod,
		ExisteBodega:  PoRetorno,
		CodServicio:   PoCodSer,
		DesServicio:   PoDesSer,
		CodBodEstPeri: PoCodestbod,
		DesBodEstPeri: PoDesestbod,
	}

	retornoValores := []models.ValidaBodega{valores}

	json.NewEncoder(w).Encode(retornoValores)

	models.EnableCors(&w)

	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
