package models

// ParamLotesDelProd is...
type ParamLotesDelProd struct {
	Servidor   string `json:"servidor"`
	HDGCodigo  int    `json:"hdgcodigo"`
	ESACodigo  int    `json:"esacodigo"`
	CMECodigo  int    `json:"cmecodigo"`
	CodMei     string `json:"codmei"`
	BodOrigen  int    `json:"bodorigen"`
	BodDestino int    `json:"boddestino"`
	CliID      int    `json:"cliid"`
}
