package logging

import (
	"log"
	"os"
)

type iniciarLogParams struct {
	nombreArchivo string
	mensajeExito  string
	mensajeError  string
	tipoLogger    TipoLogger
}

// Inicializa los loggers. Esta función debe ser llamada una sola vez al inicio
// del programa pasando los tipos de loggers que se van a usar en este.
func InicializarLoggers(loggerNecesitados ...TipoLogger) {
	for _, tipoLogger := range loggerNecesitados {
		switch tipoLogger {
		case MainLogger:
			initLogger(iniciarLogParams{
				nombreArchivo: "main.log",
				mensajeExito:  "Logs servicios REST abiertos exitosamente",
				mensajeError:  "No se puede abrir archivo de logs principal",
				tipoLogger:    tipoLogger,
			})
		case Fin700Logger:
			initLogger(iniciarLogParams{
				nombreArchivo: "loggerXML.log",
				mensajeExito:  "Logs FIN 700 abiertos exitosamente",
				mensajeError:  "No se puede abrir archivo de logs a fin 700",
				tipoLogger:    tipoLogger,
			})
		case OrdenCompraLogger:
			initLogger(iniciarLogParams{
				nombreArchivo: "ordencompra.log",
				mensajeExito:  "Logs orden de compra abiertos exitosamente",
				mensajeError:  "No se puede abrir archivo de logs de orden de compra",
				tipoLogger:    tipoLogger,
			})
		case TokenLogger:
			initLogger(iniciarLogParams{
				nombreArchivo: "token.log",
				mensajeExito:  "Logs de autenticacion abiertos exitosamente",
				mensajeError:  "No se puede abrir archivo de logs de autenticacion",
				tipoLogger:    tipoLogger,
			})
		case ReiniciaServiciosLogger:
			initLogger(iniciarLogParams{
				nombreArchivo: "restart.log",
				mensajeExito:  "Logs de reinicio de servicios abiertos exitosamente",
				mensajeError:  "No se puede abrir archivo de reinicio de servicios",
				tipoLogger:    tipoLogger,
			})
		case BDConnectionLogger:
			initLogger(iniciarLogParams{
				nombreArchivo: "BDConnection.log",
				mensajeExito:  "Logs de Estadisticas de conexion a la BD",
				mensajeError:  "No se puede abrir archivo de Estadisticas de conexion a la BD",
				tipoLogger:    tipoLogger,
			})
		case TruncadorLogger:
			initLogger(iniciarLogParams{
				nombreArchivo: "truncador.log",
				mensajeExito:  "Logs del truncador de tablas abiertos exitosamente",
				mensajeError:  "No se puede abrir archivo de logs del truncador de tablas",
				tipoLogger:    tipoLogger,
			})
		default:
			log.Fatalf("FATAL: \"%s\" no es un tipo de logger reconocido\n", tipoLogger)
		}
	}
}

func initLogger(params iniciarLogParams) {
	archivo, err := os.OpenFile(params.nombreArchivo, os.O_APPEND|os.O_CREATE|os.O_RDWR, 0666)
	if err != nil {
		log.Fatalf("FATAL: %s. Error: %s", params.mensajeError, err.Error())
	}

	agregarLoggerAlPool(archivo, params.tipoLogger)

	logger := ObtenerLogger(params.tipoLogger)

	logger.Info(InformacionLog{Mensaje: params.mensajeExito})
}

// IMPORTANTE: El logger se tiene que haber inicializado previamente pasando el
// tipo de logger a la función InicializarLoggers().
func ObtenerLogger(tipoLogger TipoLogger) *LogisticoLogger {
	return nuevoLogisticoLogger(tipoLogger)
}
