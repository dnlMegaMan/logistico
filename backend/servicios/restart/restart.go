package main

import (
	"log"
	"net/http"

	"github.com/joho/godotenv"

	controller "sonda.com/logistico/Modulos/controller"
	logs "sonda.com/logistico/logging"
	mdw "sonda.com/logistico/middleware"
)

func main() {
	// CARGAR VARIABLES DE ENTORNO
	err := godotenv.Load()
	if err != nil {
		log.Fatal("No puede cargar variables de entorno", err.Error())
	}

	// CONFIGURAR LOGS
	logs.InicializarLoggers(logs.ReiniciaServiciosLogger, logs.BDConnectionLogger)
	tipoLogger := logs.ReiniciaServiciosLogger
	logger := logs.ObtenerLogger(tipoLogger)

	// DEFINIR SERVICIOS
	http.HandleFunc("/levantar-servicios", mdw.PanicRecovery(tipoLogger, mdw.Preflight(controller.ReiniciarServicios)))

	// LEVANTAR SERVIDOR
	msgInicioServicios := "Inicio de restart.go en http://localhost:8094"
	log.Println(msgInicioServicios)
	logger.Info(logs.InformacionLog{Mensaje: msgInicioServicios})

	log.Fatal(http.ListenAndServe(":8094", nil))
}
