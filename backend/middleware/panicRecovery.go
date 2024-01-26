package middleware

import (
	"errors"
	"fmt"
	"net/http"
	"runtime"

	"sonda.com/logistico/Modulos/models"
	logs "sonda.com/logistico/logging"
)

// Fuente: https://www.jajaldoang.com/post/handle-panic-in-http-server-using-middleware-go/#how-to-recover-panic-using-middleware
func PanicRecovery(tipoLogger logs.TipoLogger, h func(w http.ResponseWriter, r *http.Request)) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if errOriginal := recover(); errOriginal != nil {
				buf := make([]byte, 2048)
				n := runtime.Stack(buf, false)
				buf = buf[:n]

				// ESTANDARIZAR ERROR
				var err error
				switch x := errOriginal.(type) {
				case string:
					err = errors.New(x)
				case error:
					err = x
				default:
					err = errors.New("error desconocido")
				}

				// LOGUEAR ERROR
				logger := logs.ObtenerLogger(tipoLogger)
				logger.Error(logs.InformacionLog{
					Mensaje: "Panic desconocido encontrado",
					Error:   err,
					Contexto: map[string]interface{}{
						"errorOriginal": fmt.Sprintf("%s", errOriginal),
						"buffer":        fmt.Sprintf("BUFFER: %s\n", buf),
					},
				})

				// ENVIAR RESPUESTA
				models.EnableCors(&w)
				http.Error(w, "Error panic desconocido", http.StatusInternalServerError)
			}
		}()

		h(w, r)
	}
}
