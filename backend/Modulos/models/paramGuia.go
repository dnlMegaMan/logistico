package models

// ParamGuia is...
type ParamGuia struct {
	HDGCodigo   int    `json:"hdgcodigo"`
	ESACodigo   int    `json:"esacodigo"`
	CMECodigo   int    `json:"cmecodigo"`
	NumeroDocOc int    `json:"numerodococ"`
	ProveedorID int    `json:"proveedorid"`
	TipDocID    int    `json:"tipdocid"`
	PiUsuario   string `json:"usuario"`
	PiServidor  string `json:"servidor"`
}
