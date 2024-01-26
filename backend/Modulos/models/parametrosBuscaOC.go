package models

// ParametrosBuscaOC is...
type ParametrosBuscaOC struct {
	PiHDGCodigo int    `json:"hdgcodigo"`
	PiESACodigo int    `json:"esacodigo"`
	PiCMECodigo int    `json:"cmecodigo"`
	PinumOC     int    `json:"numerodococ"`
	PiUsuario   string `json:"usuario"`
	PiServidor  string `json:"servidor"`
}
