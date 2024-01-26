package models

// ParamSelStockCritico is...
type ParamSelStockCritico struct {
	PiHDGCodigo int    `json:"hdgcodigo"`
	PiESACodigo int    `json:"esacodigo"`
	PiCMECodigo int    `json:"cmecodigo"`
	PiServidor  string `json:"servidor"`
	PiCodBodega int    `json:"codbodega"`
}
