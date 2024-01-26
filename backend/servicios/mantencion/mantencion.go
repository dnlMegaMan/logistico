package main

import (
	"encoding/json"
	"log"
	"net/http"
)

type MensajeMantencion struct {
	SistemaEnMantencion string `json:"sistemaEnMantencion"` // Debe ser mismo nombre que en controller\InformacionGeneral.go
	Detalles            string `json:"detalles"`
}

func main() {

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST,GET,OPTIONS,PUT,DELETE,PATCH,HEAD")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		w.Header().Set("Content-Type", "application/json")

		if r.Method == "OPTIONS" { // Para manejar las peticiones preflight del Chrome
			w.WriteHeader(http.StatusOK)
			return
		}

		w.WriteHeader(http.StatusServiceUnavailable)
		json.NewEncoder(w).Encode(MensajeMantencion{
			SistemaEnMantencion: "SI",
			Detalles:            "El sistema se encuentra actualmente en mantención",
		})
	})

	log.Println("Levantando servidor de mantención...") // Para la consola
	go http.ListenAndServe(":8091", nil)
	go http.ListenAndServe(":8092", nil)
	http.ListenAndServe(":8093", nil)
}
