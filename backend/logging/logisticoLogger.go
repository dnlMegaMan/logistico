package logging

import (
	"fmt"
	"io"
	"log"
	"os"
	"runtime"
	"strings"

	"github.com/rs/zerolog"
)

var loggerPool map[TipoLogger]zerolog.Logger = make(map[TipoLogger]zerolog.Logger)

type LogisticoLogger struct {
	usuario    string
	tipoLogger TipoLogger
	logger     *zerolog.Logger
}

func agregarLoggerAlPool(archivo io.Writer, tipoLogger TipoLogger) {
	zerolog.TimeFieldFormat = "2006-01-02 15:04:05"

	nivelLogueo := strings.ToUpper(os.Getenv("LOGISTICO_NIVEL_LOGUEO"))

	switch nivelLogueo {
	case "ERROR":
		loggerPool[tipoLogger] = zerolog.New(archivo).With().Timestamp().Logger().With().Logger().Level(zerolog.ErrorLevel)
	case "WARN":
		loggerPool[tipoLogger] = zerolog.New(archivo).With().Timestamp().Logger().With().Logger().Level(zerolog.WarnLevel)
	case "INFO":
		loggerPool[tipoLogger] = zerolog.New(archivo).With().Timestamp().Logger().With().Logger().Level(zerolog.InfoLevel)
	case "DEBUG":
		loggerPool[tipoLogger] = zerolog.New(archivo).With().Timestamp().Logger().With().Logger().Level(zerolog.DebugLevel)
	case "TRACE":
		loggerPool[tipoLogger] = zerolog.New(archivo).With().Timestamp().Logger().With().Logger().Level(zerolog.TraceLevel)
	default:
		log.Fatalf("FATAL: \"%s\" no es un nivel de logueo válido. Defina la variable de entorno LOGISTICO_NIVEL_LOGUEO con el nivel de logueo adecuado. \n", nivelLogueo)
	}
}

func nuevoLogisticoLogger(tipoLogger TipoLogger) *LogisticoLogger {
	logger := loggerPool[tipoLogger]

	return &LogisticoLogger{
		usuario:    "",
		tipoLogger: tipoLogger,
		logger:     &logger,
	}
}

func (logger *LogisticoLogger) SetUsuario(usuario string) {
	logger.usuario = usuario
}

func extraerNombreArchivo(filename string) string {
	partes := strings.Split(filename, "/")

	return partes[len(partes)-1]
}

func realizarLogueo(logEvent *zerolog.Event, l *LogisticoLogger, logInfo InformacionLog) {
	// INFORMACION DEL ARCHIVO
	pc, _, _, _ := runtime.Caller(2)
	file, line := runtime.FuncForPC(pc).FileLine(pc)

	logEvent = logEvent.Str("file", fmt.Sprintf("%s:%d", extraerNombreArchivo(file), line))

	logEvent = logEvent.Str("funcion", extraerNombreArchivo(runtime.FuncForPC(pc).Name()))

	// INFORMACION DEL LOG
	if l.usuario != "" {
		logEvent = logEvent.Str("usuario", l.usuario)
	}

	if logInfo.Query != "" {
		logEvent = logEvent.Str("query", logInfo.Query)
	}

	if logInfo.JSONEntrada != nil {
		logEvent = logEvent.Interface("request", logInfo.JSONEntrada)
	}

	if logInfo.Error != nil {
		logEvent = logEvent.Str("error", logInfo.Error.Error())
	}

	if logInfo.Contexto != nil {
		logEvent = logEvent.Interface("contexto", logInfo.Contexto)
	}

	// LOGUEAR
	logEvent.Msg(logInfo.Mensaje)
}

// Loguea y TERMINA EL PROGRAMA.
//
// USAR SOLO CUANDO SEA ESTRICTAMENTE NECESARIO Y CUANDO SEA LA ULTIMA OPCIÓN.
func (l *LogisticoLogger) Fatal(logInfo InformacionLog) {
	realizarLogueo(l.logger.Fatal(), l, logInfo)
}

func (l *LogisticoLogger) Error(logInfo InformacionLog) {
	realizarLogueo(l.logger.Error(), l, logInfo)
}

func (l *LogisticoLogger) Warn(logInfo InformacionLog) {
	realizarLogueo(l.logger.Warn(), l, logInfo)
}

func (l *LogisticoLogger) Info(logInfo InformacionLog) {
	realizarLogueo(l.logger.Info(), l, logInfo)
}

func (l *LogisticoLogger) Debug(logInfo InformacionLog) {
	realizarLogueo(l.logger.Debug(), l, logInfo)
}

func (l *LogisticoLogger) Trace(logInfo InformacionLog) {
	realizarLogueo(l.logger.Trace(), l, logInfo)
}

// Para loguear la entrada a un controlador. Loguea con nivel TRACE
func (l *LogisticoLogger) LoguearEntrada() {
	pc, _, _, _ := runtime.Caller(1)
	funcion := runtime.FuncForPC(pc).Name()

	realizarLogueo(l.logger.Trace(), l, InformacionLog{Mensaje: "Entrando a " + extraerNombreArchivo(funcion)})
}

// Para loguear la salida de un controlador. Loguea con nivel TRACE
func (l *LogisticoLogger) LoguearSalida() {
	pc, _, _, _ := runtime.Caller(1)
	funcion := runtime.FuncForPC(pc).Name()

	realizarLogueo(l.logger.Trace(), l, InformacionLog{Mensaje: "Saliendo de " + extraerNombreArchivo(funcion)})
}
