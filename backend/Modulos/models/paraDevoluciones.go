package models

// ParaDevoluciones is...
type ParaDevoluciones struct {
	DetalleMovID int    `json:"detallemovid"`
	PiUsuario    string `json:"usuario"`
	PiServidor   string `json:"servidor"`
}
