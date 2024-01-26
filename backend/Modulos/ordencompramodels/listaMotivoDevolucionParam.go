package models

// ListaMotivoDevolucionEntrada is...
type ListaMotivoDevolucionEntrada struct {
	HDGCodigo int    `json:"hdgcodigo"`
	ESACodigo int    `json:"esacodigo"`
	CMECodigo int    `json:"cmecodigo"`
	Servidor  string `json:"servidor"`
}

// ListaMotivoDevolucionSalida is...
type ListaMotivoDevolucionSalida struct {
	CodMotivoDevolucion int    `json:"codmotivodevolucion"`
	GlsMotivoDevolucion string `json:"glsmotivodevolucion"`
	Mensaje             string `json:"mensaje"`
}
