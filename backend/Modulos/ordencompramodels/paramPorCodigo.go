package models

// ParamPorCodigo is...
type ParamPorCodigo struct {
	PiHDGCodigo      int    `json:"hdgcodigo"`
	PiESACodigo      int    `json:"esacodigo"`
	PiCMECodigo      int    `json:"cmecodigo"`
	PiCodigo         string `json:"codigo"`
	PiTipoDeProducto string `json:"tipodeproducto"`
	PiUsuario        string `json:"usuario"`
	PiServidor       string `json:"servidor"`
	PiProveedor      int    `json:"proveedor"`
}
