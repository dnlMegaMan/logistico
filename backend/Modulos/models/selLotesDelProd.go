package models

// SelLotesDelProd is...
type SelLotesDelProd struct {
	BodOrigen   int    `json:"bodorigen"`
	BodDestino  int    `json:"boddestino"`
	Lote        string `json:"lote"`
	FechaVto    string `json:"fechavto"`
	MeInID      int    `json:"meinid"`
	CodMei      string `json:"codmei"`
	Cantidad    int    `json:"cantidad"`
	Descripcion string `json:"descripcion"`
	CantidadDev int    `json:"cantidaddev"`
	MeInTipoReg string `json:"meintiporeg"`
	GlsCombo    string `json:"glscombo"`
	Row         int    `json:"row"`
}
