package models

// ListaEstadoOcEntrada is...
type ListaEstadoOcEntrada struct {
	Servidor string `json:"servidor"`
}

// ListaEstadoOcSalida is...
type ListaEstadoOcSalida struct {
	CodEstadoOc int    `json:"codestadooc"`
	GlsEstadoOc string `json:"glsestadooc"`
	Mensaje     string `json:"mensaje"`
}
