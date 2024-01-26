package models

// ListaMedioPagoEntrada is...
type ListaMedioPagoEntrada struct {
	Condicion int    `json:"condicion"`
	Servidor  string `json:"servidor"`
	HDGCodigo int    `json:"hdgcodigo"`
	ESACodigo int    `json:"esacodigo"`
	CMECodigo int    `json:"cmecodigo"`
	Usuario   string `json:"usuario"`
}

// ListaMedioPagoSalida is...
type ListaMedioPagoSalida struct {
	CodMedioPago int    `json:"codmediopago"`
	GlsMedioPago string `json:"glsmediopago"`
	Mensaje      string `json:"mensaje"`
}