package models

// EstructuraServicioUnidadBodegas is...
type EstructuraServicioUnidadBodegas struct {
	HDGCodigo    int    `json:"hdgcodigo"`
	CMECodigo    int    `json:"cmecodigo"`
	Accion       string `json:"accion"`
	IDServicio   int    `json:"idservicio"`
	DescServicio string `json:"descservicio"`
	CodUnidad    string `json:"codunidad"`
	DescUnidad   string `json:"descunidad"`
	CodBodega    int    `json:"codbodega"`
	CodServicio  string `json:"codservicio"`
	Servidor     string `json:"servidor"`
	Usuario      string `json:"usuario"`
}
