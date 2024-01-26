package models

type GrabarReglaDeServicioParam struct {
	Servidor           string `json:"servidor"`
	HDGCodigo          int    `json:"hdgcodigo"`
	ESACodigo          int    `json:"esacodigo"`
	CMECodigo          int    `json:"cmecodigo"`
	Usuario            string `json:"usuario"`
	ModificarRegla     bool   `json:"modificarRegla"`
	ReglaId            int    `json:"reglaId"`
	CodigoServicio     string `json:"codigoServicio"`
	BodegaServicio     int    `json:"bodegaServicio"`
	BodegaMedicamento  int    `json:"bodegaMedicamento"`
	BodegaInsumos      int    `json:"bodegaInsumos"`
	BodegaControlados  int    `json:"bodegaControlados"`
	BodegaConsignacion int    `json:"bodegaConsignacion"`
	CentroDeCosto      int    `json:"centroDeCosto"`
	CentroDeConsumo    int    `json:"centroDeConsumo"`
}
