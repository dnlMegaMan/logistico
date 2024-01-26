package models

// ParamInfDespachoBodegas is...
type ParamInfDespachoBodegas struct {
	PiTipoReport string `json:"tiporeport"`
	PiBodega     int    `json:"bodega"`
	PiMovimiento int    `json:"movimiento"`
	PiTipoProd   string `json:"tipoprod"`
	PiFechaini   string `json:"fechaini"`
	PiFechafin   string `json:"fechafin"`
	PiHdgCodigo  int    `json:"hdgcodigo"`
	PiEsaCodigo  int    `json:"esacodigo"`
	PiCmeCodigo  int    `json:"cmecodigo"`
}
