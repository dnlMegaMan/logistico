package models

// ParamInfMovimientosInternos is...
type ParamInfMovimientosInternos struct {
	PiTipoReport string `json:"tiporeport"`
	PiTipoMov    int    `json:"tipomov"`
	PiTipoReg    string `json:"tiporeg"`
	PiFechaIni   string `json:"fechaini"`
	PiFechaFin   string `json:"fechafin"`
	PiHdgCodigo  int    `json:"hdgcodigo"`
	PiEsaCodigo  int    `json:"esacodigo"`
	PiCmeCodigo  int    `json:"cmecodigo"`
}
