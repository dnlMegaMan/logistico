package models

// AEntrada is...
type AEntrada struct {
	Servidor  string `json:"servidor"`
	HDGCodigo int    `json:"hdgcodigo"`
	ESACodigo int    `json:"esacodigo"`
	CMECodigo int    `json:"cmecodigo"`
	Usuario   string `json:"usuario"`
}

// ASalida is...
type ASalida struct {
	Mensaje Mensaje `json:"mensaje"`
}
