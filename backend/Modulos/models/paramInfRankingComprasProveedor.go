package models

// ParamInfRankingComprasProveedor is...
type ParamInfRankingComprasProveedor struct {
	PiTipoReport string `json:"tiporeport"`
	PiFechaini   string `json:"fechaini"`
	PiFechafin   string `json:"fechafin"`
	PiHdgCodigo  int    `json:"hdgcodigo"`
	PiEsaCodigo  int    `json:"esacodigo"`
	PiCmeCodigo  int    `json:"cmecodigo"`
}
