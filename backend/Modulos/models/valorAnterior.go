package models

// ValorAnterior is...
type ValorAnterior struct {
	Fecha          string  `json:"fecha"`
	PRutCompleto   string  `json:"rutprovcompleto"`
	PDescripcion   string  `json:"descripcionprov"`
	MontoUltCompra float64 `json:"montoultcompra"`
}
