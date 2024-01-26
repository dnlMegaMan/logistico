package models

// ParamInfEstadoOrdenCompra is...
type ParamInfEstadoOrdenCompra struct {
	PiTipoReport string `json:"tiporeport"`
	PiVarOcID    int    `json:"varocid"`
	PiHdgCodigo  int    `json:"hdgcodigo"`
	PiEsaCodigo  int    `json:"esacodigo"`
	PiCmeCodigo  int    `json:"cmecodigo"`
}
