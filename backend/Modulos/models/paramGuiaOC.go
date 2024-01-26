package models

// ParamGuiaOC is...
type ParamGuiaOC struct {
	HDGCodigo   int    `json:"hdgcodigo"`
	ESACodigo   int    `json:"esacodigo"`
	CMECodigo   int    `json:"cmecodigo"`
	NumeroDocOc int    `json:"numerodococ"`
	OcODetID    int    `json:"ocodetid"`
	PiUsuario   string `json:"usuario"`
	PiServidor  string `json:"servidor"`
}
