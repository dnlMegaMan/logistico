package middleware

import (
	"net/http"
	"strings"

	"sonda.com/logistico/Modulos/models"
)

// Fuente: https://www.jajaldoang.com/post/handle-panic-in-http-server-using-middleware-go/#how-to-recover-panic-using-middleware
func Preflight(h func(w http.ResponseWriter, r *http.Request)) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		if strings.ToUpper(r.Method) == "OPTIONS" {
			models.EnableCors(&w)
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			w.Write([]byte("OK"))
		} else {
			h(w, r)
		}
	}
}
