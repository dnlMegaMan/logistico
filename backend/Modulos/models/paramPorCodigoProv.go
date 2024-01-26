package models

// ParamPorCodigoProv is...
type ParamPorCodigoProv struct {
	PiHDGCodigo int    `json:"hdgcodigo"`
	PiESACodigo int    `json:"esacodigo"`
	PiCMECodigo int    `json:"cmecodigo"`
	PiCodigo    string `json:"codigo"`
	PiServidor  string `json:"servidor"`
	PiProveedor int    `json:"proveedor"`
}
