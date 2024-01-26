package models

// ParamInfDetalleOrdenCompra is...
type ParamInfDetalleOrdenCompra struct {
	PiTipoReport string `json:"tiporeport"`
	PiTipoMed    string `json:"tipomed"`
	PiFechaini   string `json:"fechaini"`
	PiFechafin   string `json:"fechafin"`
	PiHdgCodigo  int    `json:"hdgcodigo"`
	PiEsaCodigo  int    `json:"esacodigo"`
	PiCmeCodigo  int    `json:"cmecodigo"`
}
