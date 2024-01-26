package models

// ParamInfTendenciaConsumo is...
type ParamInfTendenciaConsumo struct {
	PiServidor         string `json:"servidor"`
	PiUsuario          string `json:"usuario"`
	PiTipoReport string `json:"tiporeport"`
	PiTiporeg    string `json:"tiporeg"`
	PiTipomed    int    `json:"tipomed"`
	PiFechaini   string `json:"fechaini"`
	PiFechafin   string `json:"fechafin"`
	PiCodBodega    int    `json:"codbodega"`
	PiHdgCodigo  int    `json:"hdgcodigo"`
	PiEsaCodigo  int    `json:"esacodigo"`
	PiCmeCodigo  int    `json:"cmecodigo"`
}
