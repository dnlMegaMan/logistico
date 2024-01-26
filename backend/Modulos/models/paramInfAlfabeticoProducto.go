package models

// ParamInfAlfabeticoProducto is...
type ParamInfAlfabeticoProducto struct {
	PiTipoReport string `json:"tiporeport"`
	PiCodigo     int    `json:"codigo"`
	PiTipoReg    string `json:"tiporeg"`
	PiHdgCodigo  int    `json:"hdgcodigo"`
	PiEsaCodigo  int    `json:"esacodigo"`
	PiCmeCodigo  int    `json:"cmecodigo"`
}
