package models

// ParamGrabaBodega is...
type ParamGrabaBodega struct {
	PiHDGCodigo int    `json:"hdgcodigo"`
	PiESACodigo int    `json:"esacodigo"`
	PiCMECodigo int    `json:"cmecodigo"`
	CodBodega   int    `json:"codbodega"`
	DesBodega   string `json:"desbodega"`
	CodNuevo    string `json:"codnuevo"`
	PiUsuario   string `json:"usuario"`
	PiServidor  string `json:"servidor"`
}
