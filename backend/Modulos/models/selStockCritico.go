package models

// SelStockCritico is...
type SelStockCritico struct {
	CodBodega    int    `json:"codbodega"`
	DesBodega    string `json:"desbodega"`
	MeInIDProd   int    `json:"meinidprod"`
	MeInCodProd  string `json:"meincodprod"`
	MeInDesProd  string `json:"meindesprod"`
	StockActual  int    `json:"stockactual"`
	StockCritico int    `json:"stockcritico"`
	CantAReponer int    `json:"cantareponer"`
}
