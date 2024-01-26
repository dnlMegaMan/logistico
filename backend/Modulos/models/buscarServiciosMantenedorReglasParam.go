package models

type BuscarServiciosMantenedorReglasParam struct {
	HDGCodigo     int    `json:"hdgcodigo"`
	ESACodigo     int    `json:"esacodigo"`
	CMECodigo     int    `json:"cmecodigo"`
	Usuario       string `json:"usuario"`
	Servidor      string `json:"servidor"`
	ConReglas     bool   `json:"conReglas"`
	TextoBusqueda string `json:"textoBusqueda"`
}

type ServicioMantenedorReglas struct {
	Codigo       string `json:"codigo"`
	Descripcion  string `json:"descripcion"`
	TipoServicio int    `json:"tipoServicio"`
}
