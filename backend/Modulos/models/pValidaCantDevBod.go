package models

// PValidaCantDevBod is...
type PValidaCantDevBod struct {
	Servidor          string `json:"servidor"`
	HDGCodigo         int    `json:"hdgcodigo"`
	ESACodigo         int    `json:"esacodigo"`
	BodOrigen         int    `json:"bodorigen"`
	BodDestino        int    `json:"boddestino"`
	CMECodigo         int    `json:"cmecodigo"`
	CodMei            string `json:"codmei"`
	Lote              string `json:"lote"`
	CantidadADevolver int    `json:"cantidadadevolver"`
}
