package models

// BuscarUltimaRecepEntrada is...
type BuscarUltimaRecepEntrada struct {
	HDGCODIGO int    `json:"hdgcodigo"`
	ESACODIGO int    `json:"esacodigo"`
	CMECODIGO int    `json:"cmecodigo"`
	Servidor  string `json:"servidor"`
}

// BuscarUltimaRecepSalida is...
type BuscarUltimaRecepSalida struct {
	OdmoId  int    `json:"orcoid"`
	Mensaje string `json:"mensaje"`
}
