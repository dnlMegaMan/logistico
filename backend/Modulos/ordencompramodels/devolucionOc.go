package models

// DevolucionOcEntrada is...
type DevolucionOcEntrada struct {
	Servidor    string `json:"servidor"`
	Responsable string `json:"responsable"`
	//Fechadev string    `json:"fechadev"`
	DetalleMov []DetalleMovimientoDev `json:"detallemov"`
}

type DetalleMovimientoDev struct {
	Odmoid    int    `json:"odmoid"`
	Adevolver int    `json:"adevolver"`
	TipoDev   int    `json:"tipodev"`
	FechaDev  string `json:"fechadev"`
	NotaDev   int    `json:"notadev"`
}
