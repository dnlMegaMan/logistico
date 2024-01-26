package models

// BuscaStockBodegasParam is...
type BuscaStockBodegasParam struct {
	Servidor  string `json:"servidor"`
	HDGCodigo int    `json:"hdgcodigo"`
	ESACodigo int    `json:"esacodigo"`
	CMECodigo int    `json:"cmecodigo"`
	Usuario   string `json:"usuario"`
	MeinID    int    `json:"meinid"`
}
