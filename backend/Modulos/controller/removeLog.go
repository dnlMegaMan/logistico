package controller

import (
	"encoding/json"
	"net/http"
	"os"

	logs "sonda.com/logistico/logging"
)

// RemoveLog is...
func RemoveLog(w http.ResponseWriter, r *http.Request) {
	logger := logs.ObtenerLogger(logs.MainLogger)

	err := os.Remove("logger.log")
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "Error al eliminar los logs",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	json.NewEncoder(w).Encode("Exito")
	w.Header().Set("Content-Type", "application/json")
}
