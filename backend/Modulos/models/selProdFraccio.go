package models

// SelProdFraccio is...
type SelProdFraccio struct {
	MeInCodProd string `json:"meincodprod"`
	MeInDesProd string `json:"meindesprod"`
	StockActual int    `json:"stockactual"`
	MeInIDProd  int    `json:"meinidprod"`
}
