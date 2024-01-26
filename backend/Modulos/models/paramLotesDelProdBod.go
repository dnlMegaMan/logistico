package models

// ParamLotesDelProdBod is...
type ParamLotesDelProdBod struct {
	Servidor   string `json:"servidor"`
	HDGCodigo  int    `json:"hdgcodigo"`
	ESACodigo  int    `json:"esacodigo"`
	CMECodigo  int    `json:"cmecodigo"`
	CodMei     string `json:"codmei"`
	BodOrigen  int    `json:"bodorigen"`
	BodDestino int    `json:"boddestino"`
}
