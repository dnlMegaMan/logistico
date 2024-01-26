package models

// ParamInfReimpresionRecepcionOc is...
type ParamInfReimpresionRecepcionOc struct {
	PiTipoReport string `json:"tiporeport"`
	PiNdoc       int    `json:"ndoc"`
	PiNguia      int    `json:"nguia"`
	PiHdgCodigo  int    `json:"hdgcodigo"`
	PiEsaCodigo  int    `json:"esacodigo"`
	PiCmeCodigo  int    `json:"cmecodigo"`
}
