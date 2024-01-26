package models

import "net/http"

// EnableCors is...
func EnableCors(w *http.ResponseWriter) {
	(*w).Header().Set("Access-Control-Allow-Origin", "*")
	(*w).Header().Set("Access-Control-Allow-Methods", "POST,GET,OPTIONS,PUT,DELETE,PATCH,HEAD")
	(*w).Header().Set("Access-Control-Allow-Headers", "Content-Type")
}
