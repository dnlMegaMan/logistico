package models

// DetalleMovimDevol is...
type DetalleMovimDevol struct {
	DetalleMovID     int    `json:"detallemovid"`
	FechaMovDevol    string `json:"fechamovdevol"`
	CantidadDevol    int    `json:"cantidaddevol"`
	ResponsableNom   string `json:"responsablenom"`
	CantidadDevolTot int    `json:"cantidaddevoltot"`
}
