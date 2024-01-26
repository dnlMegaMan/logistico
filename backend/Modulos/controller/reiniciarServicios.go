package controller

import (
	"errors"
	"net/http"
	"os/exec"
	"runtime"
	"strings"

	"sonda.com/logistico/Modulos/models"
	logs "sonda.com/logistico/logging"
)

func ReiniciarServicios(w http.ResponseWriter, r *http.Request) {
	logger := logs.ObtenerLogger(logs.ReiniciaServiciosLogger)
	logger.LoguearEntrada()

	models.EnableCors(&w)
	w.Header().Set("Content-Type", "application/json")

	if r.Method == "OPTIONS" { // Para manejar las peticiones preflight del Chrome
		w.WriteHeader(http.StatusOK)
		return
	}

	var cmd *exec.Cmd = nil
	if strings.Contains(runtime.GOOS, "windows") {
		cmd = exec.Command("reinciar_servicios.bat")
	} else if strings.Contains(runtime.GOOS, "linux") {
		cmd = exec.Command("./reiniciar_servicios.sh")
	}

	if cmd == nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "No se pudieron reiniciar los servicios:",
			Error:   errors.New("SO no sportado"),
		})
		http.Error(w, "SO no sportado", http.StatusInternalServerError)
		return
	}

	err := cmd.Run()
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "No se pudieron reiniciar los servicios",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("{ \"ok\": true }"))

	logger.LoguearSalida()
}
