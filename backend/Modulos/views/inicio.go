package controller

import (
	"net/http"
	"text/template"
)

var plantillas = template.Must(template.ParseGlob("../src/Modulos/views/*"))

// Inicio is...
func Inicio(w http.ResponseWriter, r *http.Request) {
	plantillas.ExecuteTemplate(w, "inicio", nil)
}
