package models

type BuscaBodegasParaMantenedorDeReglasParam struct {
	HDGCodigo int    `json:"hdgcodigo"`
	ESACodigo int    `json:"esacodigo"`
	CMECodigo int    `json:"cmecodigo"`
	Usuario   string `json:"usuario"`
	Servidor  string `json:"servidor"`
}

type BodegaMantenedorReglas struct {
	HDGCodigo   int    `json:"hdgcodigo"`
	ESACodigo   int    `json:"esacodigo"`
	CMECodigo   int    `json:"cmecodigo"`
	FbodCodigo  int    `json:"fbodCodigo"`
	Descripcion string `json:"descripcion"`
}
