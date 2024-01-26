package models

// MovimientosFarmaciaDetDevol is...
type MovimientosFarmaciaDetDevol struct {
	MovimFarDetID      int    `json:"movimfardetid"`
	MovimFarDetDevolID int    `json:"movimfardetdevolid"`
	MovTipo            int    `json:"tipomov"`
	FechaMovDevol      string `json:"fechamovdevol"`
	CantidadDevol      int    `json:"cantidaddevol"`
	ResponsableNom     string `json:"responsablenom"`
	CuentaCargoID      int    `json:"cuentacargoid"`
	CantidadDevolTot   int    `json:"cantidaddevoltot"`
}
