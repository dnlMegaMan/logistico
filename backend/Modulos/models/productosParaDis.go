package models

// ProductosParaDis is...
type ProductosParaDis struct {
	HDGCodigo   int    `json:"hdgcodigo"`
	ESACodigo   int    `json:"esacodigo"`
	CMECodigo   int    `json:"cmecodigo"`
	MeInCodMeI  string `json:"meincodmei"`
	MeInDescri  string `json:"meindescri"`
	StockActual int    `json:"stockactual"`
	MeInID      int    `json:"meinid"`
	Campo       string `json:"campo"`
}
