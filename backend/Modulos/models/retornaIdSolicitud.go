package models

// RetornaIDSolicitud is...
type RetornaIDSolicitud struct {
	SolicitudBodID int     `json:"solbodid"`
	IDPedidoFin700 int     `json:"idpedidofin700"`
	Mensajes     []RetornaIDSolicitudError `json:"mensajes"`
}

// RetornaIDSolicitudError is...
type RetornaIDSolicitudError struct {
	CodMei  string `json:"codmei"`
	Titulo string `json:"titulo"`
	Text   string `json:"text"`
}
