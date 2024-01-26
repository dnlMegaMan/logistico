package models

// ParamInfDocumentosIngresados is...
type ParamInfDocumentosIngresados struct {
	PiTipoReport string `json:"tiporeport"`
	PiFechaini   string `json:"fechaini"`
	PiFechafin   string `json:"fechafin"`
	PiTipoMov    int    `json:"tipomov"`
	PiTipoReg    string `json:"tiporeg"`
	PiHdgCodigo  int    `json:"hdgcodigo"`
	PiEsaCodigo  int    `json:"esacodigo"`
	PiCmeCodigo  int    `json:"cmecodigo"`
}
