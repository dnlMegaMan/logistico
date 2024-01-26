package models

type ConsultaBodegaLotesParam struct {
	Servidor       string `json:"servidor"`
	Usuario        string `json:"usuario"`
	HDGCodigo      int    `json:"hdgcodigo"`
	ESACodigo      int    `json:"esacodigo"`
	CMECodigo      int    `json:"cmecodigo"`
	Lote           string `json:"lote"`
	CodigoProducto string `json:"codigoProducto"`
}

type BodegaConLote struct {
	Codigo      string `json:"codigo"`
	Descripcion string `json:"descripcion"`
	Saldo       int    `json:"saldo"`
}
