package models

// ParamWmConsultaSaldo is...
type ParamWmConsultaSaldo struct {
	Servidor       string `json:"servidor"`
	Empresa        string `json:"empresa"`
	Division       string `json:"division"`
	Bodega         int    `json:"bodega"`
	Producto       string `json:"producto"`
	IndicadorSaldo int    `json:"indicadorsaldo"`
}
