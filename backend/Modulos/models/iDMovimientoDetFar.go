package models

// IDMovimientoDetFar is...
type IDMovimientoDetFar struct {
	GDetalleMovID     int     `json:"gdetallemovid"`
	GMovimFarID       int     `json:"gmovimfarid"`
	GMovFecha         string  `json:"gmovfecha"`
	GMovTipo          int     `json:"gtipomov"`
	GCodigoMein       string  `json:"gcodigomein"`
	GMeInID           int     `json:"gmeinid"`
	GCantidadMov      int     `json:"gcantidadmov"`
	GValorCosto       float64 `json:"gvalorcosto"`
	GValorVenta       float64 `json:"gvalorventa"`
	GCantidadDevol    int     `json:"gcantidaddevol"`
	GUnidadDeCompra   int     `json:"gunidaddecompra"`
	GUnidadDeDespacho int     `json:"gunidaddedespacho"`
}
