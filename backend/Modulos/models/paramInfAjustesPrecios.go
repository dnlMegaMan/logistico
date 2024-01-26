package models

// ParamInfAjustesPrecios is...
type ParamInfAjustesPrecios struct {
	PiTipoReport string `json:"tiporeport"`
	PiTipoProd   string `json:"tipoprod"`
	PiFechaIni   string `json:"fechaini"`
	PiFechaFin   string `json:"fechafin"`
	PiHdgCodigo  int    `json:"hdgcodigo"`
	PiEsaCodigo  int    `json:"esacodigo"`
	PiCmeCodigo  int    `json:"cmecodigo"`
}
