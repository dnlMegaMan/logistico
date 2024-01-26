package models

// ParamInfOrdenCompraCerradaMan is...
type ParamInfOrdenCompraCerradaMan struct {
	PiTipoReport string `json:"tiporeport"`
	PiHdgCodigo  int    `json:"hdgcodigo"`
	PiEsaCodigo  int    `json:"esacodigo"`
	PiCmeCodigo  int    `json:"cmecodigo"`
}
