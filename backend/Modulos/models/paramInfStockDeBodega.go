package models

// ParamInfStockDeBodega is...
type ParamInfStockDeBodega struct {
	PiServidor        string `json:"servidor"`
	PiUsuario         string `json:"usuario"`
	PiHdgCodigo       int    `json:"hdgcodigo"`
	PiEsaCodigo       int    `json:"esacodigo"`
	PiCmeCodigo       int    `json:"cmecodigo"`
	PiTipoReport      string `json:"tiporeport"`
	PiFbodCodigo      int    `json:"FbodCodigo"`
	PiFboCodigoBodega string `json:"FboCodigoBodega"`
}
