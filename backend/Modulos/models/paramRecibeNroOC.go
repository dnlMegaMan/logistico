package models

// ParamRecibeNroOC is...
type ParamRecibeNroOC struct {
	HDGCodigo   int    `json:"hdgcodigo"`
	ESACodigo   int    `json:"esacodigo"`
	CMECodigo   int    `json:"cmecodigo"`
	Usuario     string `json:"usuario"`
	Servidor    string `json:"servidor"`
	NumeroDocOC int    `json:"numerodococ"`
}
