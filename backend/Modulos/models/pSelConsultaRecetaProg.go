package models

// PSelConsultaRecetaProg is...
type PSelConsultaRecetaProg struct {
	PiHDGCodigo int    `json:"hdgcodigo"`
	PiESACodigo int    `json:"esacodigo"`
	PiCMECodigo int    `json:"cmecodigo"`
	PiServidor  string `json:"servidor"`
	PiUsuario   string `json:"usuario"`
	PiCliID     int    `json:"cliid"`
}
