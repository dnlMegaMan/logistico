package models

// MovimientosFarmaciaDevol is...
type MovimientosFarmaciaDevol struct {
	MovimFarID         int    `json:"movimfarid"`
	MovimFarDetid      int    `json:"movimfardetid"`
	MovimFarDetDevolID int    `json:"movimfardetdevolid"`
	MovTipo            int    `json:"tipomov"`
	FechaMovDevol      string `json:"fechamovdevol"`
	CantidadDevol      int    `json:"cantidaddevol"`
	ResponsableNom     string `json:"responsablenom"`
	CuentaCargoID      int    `json:"cuentacargoid"`
	CantidadDevolTot   int    `json:"cantidaddevoltot"`
	HDGCodigo          int    `json:"hdgcodigo"`
	ESACodigo          int    `json:"esacodigo"`
	CMECodigo          int    `json:"cmecodigo"`
	Servidor           string `json:"servidor"`
}
