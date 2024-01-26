package models

// ParamBuscaArticulosxBod is...
type ParamBuscaArticulosxBod struct {
	PiHDGCodigo   int    `json:"hdgcodigo"`
	PiESACodigo   int    `json:"esacodigo"`
	PiCMECodigo   int    `json:"cmecodigo"`
	CodBodega     int    `json:"codbodega"`
	PiUsuario     string `json:"usuario"`
	PiServidor    string `json:"servidor"`
	ControlMinimo string `json:"controlminimo"`
}
