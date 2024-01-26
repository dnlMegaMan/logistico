package models

// ParamPorTipoDeProducto is...
type ParamPorTipoDeProducto struct {
	PiHDGCodigo      int    `json:"hdgcodigo"`
	PiESACodigo      int    `json:"esacodigo"`
	PiCMECodigo      int    `json:"cmecodigo"`
	PiTipoDeProducto string `json:"tipodeproducto"`
	PiUsuario        string `json:"usuario"`
	PiServidor       string `json:"servidor"`
}
