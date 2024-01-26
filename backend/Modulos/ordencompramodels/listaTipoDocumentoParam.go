package models

// ListaTipoDocumentoEntrada is...
type ListaTipoDocumentoEntrada struct {
	HDGCodigo int    `json:"hdgcodigo"`
	CMECodigo int    `json:"cmecodigo"`
	ESACodigo int    `json:"esacodigo"`
	Servidor  string `json:"servidor"`
	Tipo      string `json:"tipo"`
}

// ListaTipoDocumentoSalida is...
type ListaTipoDocumentoSalida struct {
	CodTipoDocumento int    `json:"codtipodocumento"`
	GlsTipoDocumento string `json:"glstipodocumento"`
	Mensaje          string `json:"mensaje"`
}
