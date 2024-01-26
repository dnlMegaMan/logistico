package models

// ParamInfAjustesValorizados is...
type ParamInfAjustesValorizados struct {
	PiTipoReport string `json:"tiporeport"`
	PiCodigoBod  int    `json:"codigobod"`
	PiTipoReg    string `json:"tiporeg"`
	PiFechaIni   string `json:"fechaini"`
	PiFechaFin   string `json:"fechafin"`
	PiHdgCodigo  int    `json:"hdgcodigo"`
	PiEsaCodigo  int    `json:"esacodigo"`
	PiCmeCodigo  int    `json:"cmecodigo"`
}
