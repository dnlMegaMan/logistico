package main

import (
	"log"
	"net/http"

	"github.com/joho/godotenv"

	logs "sonda.com/logistico/logging"
	mdw "sonda.com/logistico/middleware"
	"sonda.com/logistico/tokenfile/authentication"
)

func main() { // CARGAR VARIABLES DE ENTORNO
	err := godotenv.Load()
	if err != nil {
		log.Fatal("No puede cargar variables de entorno", err.Error())
	}

	// CONFIGURAR LOGS
	logs.InicializarLoggers(logs.TokenLogger, logs.BDConnectionLogger)
	tipoLogger := logs.TokenLogger
	logger := logs.ObtenerLogger(tipoLogger)

	// DEFINIR SERVICIOS
	mux := http.NewServeMux()
	mux.HandleFunc("/login", mdw.PanicRecovery(tipoLogger, mdw.Preflight(authentication.Login)))
	mux.HandleFunc("/validate", mdw.PanicRecovery(tipoLogger, mdw.Preflight(mdw.Autenticacion(authentication.ValidateToken))))

	msgInicioServicios := "Inicio de token.go en http://localhost:8092"
	log.Println(msgInicioServicios)
	logger.Info(logs.InformacionLog{Mensaje: msgInicioServicios})

	http.ListenAndServe(":8092", mux)
}
