package models

// ParamInfDevolucionCompras is...
type ParamInfDevolucionCompras struct {
	PiTipoReport string `json:"tiporeport"`
	PiTipoReg    string `json:"tiporeg"`
	PiTipoMedi   int    `json:"tipomedi"`
	PiFechaini   string `json:"fechaini"`
	PiFechafin   string `json:"fechafin"`
	PiHdgCodigo  int    `json:"hdgcodigo"`
	PiEsaCodigo  int    `json:"esacodigo"`
	PiCmeCodigo  int    `json:"cmecodigo"`
}
