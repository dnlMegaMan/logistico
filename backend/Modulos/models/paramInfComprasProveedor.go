package models

// ParamInfComprasProveedor is...
type ParamInfComprasProveedor struct {
	PiTipoReport string `json:"tiporeport"`
	PiRutProv    int    `json:"rutprov"`
	PiFechaini   string `json:"fechaini"`
	PiFechafin   string `json:"fechafin"`
	PiHdgCodigo  int    `json:"hdgcodigo"`
	PiEsaCodigo  int    `json:"esacodigo"`
	PiCmeCodigo  int    `json:"cmecodigo"`
}
