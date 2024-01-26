package models

// ParamTraePiezas is...
type ParamTraePiezas struct {
	PiHDGCodigo   int    `json:"hdgcodigo"`
	PiESACodigo   int    `json:"esacodigo"`
	PiCMECodigo   int    `json:"cmecodigo"`
	PiIdunidad    int    `json:"idunidad"`
	PiUsuario     string `json:"usuario"`
	PiServidor    string `json:"servidor"`
	PiServicioCod string `json:"serviciocod"`
}
