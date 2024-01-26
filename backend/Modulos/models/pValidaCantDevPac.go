package models

// PValidaCantDevPac is...
type PValidaCantDevPac struct {
	Servidor          string `json:"servidor"`
	HDGCodigo         int    `json:"hdgcodigo"`
	ESACodigo         int    `json:"esacodigo"`
	CMECodigo         int    `json:"cmecodigo"`
	CliID             int    `json:"cliid"`
	CodMei            string `json:"codmei"`
	Lote              string `json:"lote"`
	CantidadADevolver int    `json:"cantidadadevolver"`
}
