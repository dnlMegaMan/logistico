package models

// ListaAnularDispensacionRecetaEntrada is...
type ListaAnularDispensacionRecetaEntrada struct {
	Servidor  string `json:"servidor"`
	HDGCodigo int    `json:"hdgcodigo"`
	ESACodigo int    `json:"esacodigo"`
	CMECodigo int    `json:"cmecodigo"`
	Usuario   string `json:"usuario"`
}

// ListaAnularDispensacionRecetaSalida is...
type ListaAnularDispensacionRecetaSalida struct {
	Codigo      int     `json:"codigo"`
	Descripcion string  `json:"descripcion"`
	Mensaje     Mensaje `json:"mensaje"`
}
