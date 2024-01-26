package models

// BuscaRegistroArticuloEntrada is...
type BuscaRegistroArticuloEntrada struct {
	HDGCODIGO int    `json:"hdgcodigo"`
	ESACODIGO int    `json:"esacodigo"`
	CMECODIGO int    `json:"cmecodigo"`
	MeinId    int    `json:"meinid"`
	Servidor  string `json:"servidor"`
}

// BuscaRegistroArticuloSalida is...
type BuscaRegistroArticuloSalida struct {
	PrmiFechaCrea string `json:"prmifechacrea"`
	RutProv       string `json:"rutprov"`
	DescProv      string `json:"descprov"`
	ValorUltima   int    `json:"valorultima"`
	Codigo        string `json:"codigo"`
	Descripcion   string `json:"descripcion"`
	Mensaje       string `json:"mensaje"`
}
