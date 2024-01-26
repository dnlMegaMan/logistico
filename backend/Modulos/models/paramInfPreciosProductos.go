package models

// ParamInfPreciosProductos is...
type ParamInfPreciosProductos struct {
	PiTipoReport string `json:"tiporeport"`
	PiCodigoFar  int    `json:"codigofar"`
	PiTipoReg    string `json:"tiporeg"`
	PiHdgCodigo  int    `json:"hdgcodigo"`
	PiEsaCodigo  int    `json:"esacodigo"`
	PiCmeCodigo  int    `json:"cmecodigo"`
}
