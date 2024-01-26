package models

// ParDetEventoSolicitud is...
type ParDetEventoSolicitud struct {
	PiHDGCodigo int    `json:"hdgcodigo"`
	PiESACodigo int    `json:"esacodigo"`
	PiCMECodigo int    `json:"cmecodigo"`
	PiSoliID    int    `json:"solid"`
	PiSodeID    int    `json:"sodeid"`
	PiServidor  string `json:"servidor"`
}
