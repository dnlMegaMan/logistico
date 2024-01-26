package models

// AnularDispensacionRecetaParamEntrada is...
type AnularDispensacionRecetaParamEntrada struct {
	Servidor  string `json:"servidor"`
	HDGCodigo int    `json:"hdgcodigo"`
	ESACodigo int    `json:"esacodigo"`
	CMECodigo int    `json:"cmecodigo"`
	Usuario   string `json:"usuario"`
	SoliID    int    `json:"soliid"`
	ReceID    int    `json:"receid"`
	Motivo    string `json:"motivo"`
}

// AnularDispensacionRecetaParamSalida is...
type AnularDispensacionRecetaParamSalida struct {
	Mensaje Mensaje      `json:"mensaje"`
	Arreglo []MyJsonName `json:"arreglo"`
}
