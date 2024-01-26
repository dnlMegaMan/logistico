package models

// ProductosEnMaestro is...
type ProductosEnMaestro struct {
	IDMeIn       int     `json:"idmein"`
	ProductoCodi string  `json:"productocodi"`
	ProductoDesc string  `json:"productodesc"`
	ProductoTipo string  `json:"productotipo"`
	ValorCosto   float64 `json:"valorcosto"`
	ValorVenta   int     `json:"valorventa"`
}
