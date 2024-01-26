package models

// ParamStockLibControlados is...
type ParamStockLibControlados struct {
	PiServidor             string `json:"servidor"`
	PiUsuario              string `json:"usuario"`
	PiHdgCodigo            int    `json:"hdgcodigo"`
	PiEsaCodigo            int    `json:"esacodigo"`
	PiCmeCodigo            int    `json:"cmecodigo"`
	PiTipoReport           string `json:"tiporeport"`
	PiCodBodegaControlados int    `json:"codbodegacontrolados"`
}
