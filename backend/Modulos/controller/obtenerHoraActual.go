package controller

import "time"

// ObtenerHoraActual is...
func ObtenerHoraActual() string {
	t := time.Now()
	return t.Format("15:04:05.000")
}
