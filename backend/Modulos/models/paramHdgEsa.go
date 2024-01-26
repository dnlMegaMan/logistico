package models

// ParamHdgEsa is...
type ParamHdgEsa struct {
	PiHDGCodigo int    `json:"hdgcodigo"`
	PiESACodigo int    `json:"esacodigo"`
	PiUsuario   string `json:"usuario"`
	PiServidor  string `json:"servidor"`
}
