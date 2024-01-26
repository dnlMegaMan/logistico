package models

// ParamBuscaStockxBod is...
type ParamBuscaStockxBod struct {
	BodegaCodigo int    `json:"bodegacodigo"`
	ProductoDesc string `json:"productodesc"`
	ProductoCodi string `json:"productocodi"`
	PiUsuario    string `json:"usuario"`
	PiServidor   string `json:"servidor"`
}
