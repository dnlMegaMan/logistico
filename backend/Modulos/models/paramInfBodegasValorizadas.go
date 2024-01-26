package models

// ParamInfBodegasValorizadas is...
type ParamInfBodegasValorizadas struct {
	PiTipoReport string `json:"tiporeport"`
	PiCodigoBod  int    `json:"codigobod"`
	PiTipoReg    string `json:"tiporeg"`
	PiHdgCodigo  int    `json:"hdgcodigo"`
	PiEsaCodigo  int    `json:"esacodigo"`
	PiCmeCodigo  int    `json:"cmecodigo"`
}
