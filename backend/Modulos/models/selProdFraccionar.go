package models

// SelProdFraccionar is...
type SelProdFraccionar struct {
	CodProdDest string  `json:"meincodprod"`
	DesProdDest string  `json:"meindesprod"`
	FactorConv  float64 `json:"factorconv"`
	StockActual int     `json:"stockactual"`
	MeInIDDest  int     `json:"meiniddest"`
}
