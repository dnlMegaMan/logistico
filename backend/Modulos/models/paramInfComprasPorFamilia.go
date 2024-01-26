package models

// ParamInfComprasPorFamilia is...
type ParamInfComprasPorFamilia struct {
	PiTipoReport string `json:"tiporeport"`
	PiTipoProd   string `json:"tipoprod"`
	PiCod        int    `json:"cod"`
	PiFechaini   string `json:"fechaini"`
	PiFechafin   string `json:"fechafin"`
	PiFamilia    int    `json:"familia"`
	PiSubFam     int    `json:"subfam"`
	PiHdgCodigo  int    `json:"hdgcodigo"`
	PiEsaCodigo  int    `json:"esacodigo"`
	PiCmeCodigo  int    `json:"cmecodigo"`
}
