package models

// ParamTraeBodegas is...
type ParamTraeBodegas struct {
	PiHDGCodigo int    `json:"hdgcodigo"`
	PiESACodigo int    `json:"esacodigo"`
	PiCMECodigo int    `json:"cmecodigo"`
	PiUsuario   string `json:"usuario"`
	PiServidor  string `json:"servidor"`
}
