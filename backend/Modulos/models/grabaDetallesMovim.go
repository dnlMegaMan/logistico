package models

// GrabaDetallesMovim is...
type GrabaDetallesMovim struct {
	MovimFarID       int     `json:"movimfarid"`
	MovTipo          int     `json:"tipomov"`
	CodigoMein       string  `json:"codigomein"`
	MeInID           int     `json:"meinid"`
	CantidadMov      int     `json:"cantidadmov"`
	ValorCosto       float64 `json:"valorcosto"`
	ValorVenta       float64 `json:"valorventa"`
	CantidadDevol    int     `json:"cantidaddevol"`
	UnidadDeCompra   int     `json:"unidaddecompra"`
	UnidadDeDespacho int     `json:"unidaddedespacho"`
	PiUsuario        string  `json:"usuario"`
	PiServidor       string  `json:"servidor"`
}
