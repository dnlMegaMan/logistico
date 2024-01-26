package models

// BuscaStockBodegasReturn is...
type BuscaStockBodegasReturn struct {
	CodigoBodega	int    `json:"bodcodigo"`
	NombreBodega 	string `json:"boddescripcion"`
	SaldoBodega 	int    `json:"stockactual"`
}
