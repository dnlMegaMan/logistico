package models

// ParamInfConsumoBodegaValo is...
type ParamInfConsumoBodegaValo struct {
	PiTipoReport string `json:"tiporeport"`
	PiBodega     int    `json:"bodega"`
	PiTipoProd   string `json:"tipoprod"`
	PiFechaini   string `json:"fechaini"`
	PiFechafin   string `json:"fechafin"`
	PiFamilia    int    `json:"familia"`
	PiSubfam     int    `json:"subfam"`
	PiHdgCodigo  int    `json:"hdgcodigo"`
	PiEsaCodigo  int    `json:"esacodigo"`
	PiCmeCodigo  int    `json:"cmecodigo"`
}
