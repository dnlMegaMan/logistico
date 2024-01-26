package models

// BuscarUltimaOcEntrada is...
type BuscarUltimaOcEntrada struct {
	Servidor  string `json:"servidor"`
	HDGCodigo int    `json:"hdgcodigo"`
	ESACodigo int    `json:"esacodigo"`
	CMECodigo int    `json:"cmecodigo"`
}

// BuscarUltimaOcSalida is...
type BuscarUltimaOcSalida struct {
	Orcoid  int    `json:"orcoid"`
	Mensaje string `json:"mensaje"`
}
