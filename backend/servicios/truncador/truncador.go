package main

import (
	"encoding/json"
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("No puede cargar variables de entorno", err.Error())
	}

	// ABRIR LOGS
	tipoLogger := logs.TruncadorLogger
	logs.InicializarLoggers(logs.TruncadorLogger)
	logger := logs.ObtenerLogger(tipoLogger)

	// REVISAR AMBIENTE
	servidor := os.Getenv("LOGISTICO_AMBIENTE_TRUNCADOR")
	if servidor == "" {
		logger.Fatal(logs.InformacionLog{Mensaje: "Varible LOGISTICO_AMBIENTE_TRUNCADOR no esta seteada"})
	}

	// CARGAR TABLAS A TRUNCAR
	raw, err := os.ReadFile("tablasPorTruncar.json")
	if err != nil {
		logger.Fatal(logs.InformacionLog{
			Mensaje: "No puede abrir archivos de configuracion de base de datos.",
			Error:   err,
		})
	}

	tablasPorTruncar := []string{}
	err = json.Unmarshal(raw, &tablasPorTruncar)
	if err != nil {
		logger.Fatal(logs.InformacionLog{
			Mensaje: "No puede parsear json con las tablas",
			Error:   err,
		})
	}

	// TRUNCAR TABLAS
	logger.Trace(logs.InformacionLog{Mensaje: "Iniciando truncado de tablas"})

	db, _ := database.GetConnection(servidor)
	for _, tabla := range tablasPorTruncar {
		query := "TRUNCATE TABLE " + tabla
		_, err = db.Exec(query)
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Fallo trunqueo de tabla",
				Query:   query,
				Error:   err,
			})
		} else {
			logger.Info(logs.InformacionLog{
				Mensaje: fmt.Sprintf("Tabla %s truncada exitosamente", tabla),
			})
		}
	}

	// OK
	logger.Trace(logs.InformacionLog{Mensaje: "Finalizo el truncado de tablas"})
}
