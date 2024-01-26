package models

// ParamBodegaSolicitante is...
type ParamBodegaSolicitante struct {
	PiHDGCodigo int    `json:"hdgcodigo"`
	PiESACodigo int    `json:"esacodigo"`
	PiCMECodigo int    `json:"cmecodigo"`
	PiCliID     int    `json:"cliid"`
	PiUsuario   string `json:"usuario"`
	PiServidor  string `json:"servidor"`
}
