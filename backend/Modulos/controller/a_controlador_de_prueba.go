package controller

import (
	"encoding/json"
	"net/http"

	"sonda.com/logistico/Modulos/models"
)

// A is...
func ControladorDePrueba(w http.ResponseWriter, r *http.Request) {
	models.EnableCors(&w)
	w.Header().Set("Content-Type", "application/json")

	respuesta := models.ModeloDePrueba{
		Mensaje: "Mensaje de prueba",
		Numero:  45435453,
	}

	json.NewEncoder(w).Encode(respuesta)
}
