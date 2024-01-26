package models

// ListaTipoOperacionEntrada is...
type ListaTipoOperacionEntrada struct {
	Servidor  string `json:"servidor"`
	HDGCodigo int    `json:"hdgcodigo"`
	ESACodigo int    `json:"esacodigo"`
	CMECodigo int    `json:"cmecodigo"`
	Usuario   string `json:"usuario"`
}

// ListaTipoOperacionSalida is...
type ListaTipoOperacionSalida struct {
	Codigo      int    `json:"codigo"`
	Descripcion string `json:"descripcion"`
	Mensaje     string `json:"mensaje"`
}
