package models

type BuscaReglasPorCodigoDeServicioParam struct {
	HDGCodigo      int    `json:"hdgcodigo"`
	ESACodigo      int    `json:"esacodigo"`
	CMECodigo      int    `json:"cmecodigo"`
	Usuario        string `json:"usuario"`
	Servidor       string `json:"servidor"`
	CodigoServicio string `json:"codigoServicio"`
}

type ReglasServicio struct {
	ReglaId            int    `json:"reglaId"`
	HDGCodigo          int    `json:"hdgcodigo"`
	ESACodigo          int    `json:"esacodigo"`
	CMECodigo          int    `json:"cmecodigo"`
	CodigoServicio     string `json:"codigoServicio"`
	BodegaServicio     int    `json:"bodegaServicio"`
	BodegaMedicamento  int    `json:"bodegaMedicamento"`
	BodegaInsumos      int    `json:"bodegaInsumos"`
	BodegaControlados  int    `json:"bodegaControlados"`
	BodegaConsignacion int    `json:"bodegaConsignacion"`
	CentroDeCosto      int    `json:"centroDeCosto"`
	CentroDeConsumo    int    `json:"centroDeConsumo"`
}
