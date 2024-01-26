package models

type ConsultaProductoLotesParam struct {
	Servidor    string `json:"servidor"`
	Usuario     string `json:"usuario"`
	HDGCodigo   int    `json:"hdgcodigo"`
	ESACodigo   int    `json:"esacodigo"`
	CMECodigo   int    `json:"cmecodigo"`
	Lote        string `json:"lote"`
	Codigo      string `json:"codigo"`
	Descripcion string `json:"descripcion"`
}

type ProductoConLote struct {
	Lote             string `json:"lote"`
	FechaVencimiento string `json:"fechaVencimiento"`
	ProductoId       int    `json:"meinId"`
	Codigo           string `json:"codigo"`
	Descripcion      string `json:"descripcion"`
}
