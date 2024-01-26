package models

// ParEventoSolicitud is...
type ParEventoSolicitud struct {
	PiHDGCodigo int    `json:"hdgcodigo"`
	PiESACodigo int    `json:"esacodigo"`
	PiCMECodigo int    `json:"cmecodigo"`
	PiSoliID    int    `json:"solid"`
	PiServidor  string `json:"servidor"`
}
