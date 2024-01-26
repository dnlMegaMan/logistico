package models

// Bodegas is...
type Bodegas struct {
	HDGCodigo     int    `json:"hdgcodigo"`
	ESACodigo     int    `json:"esacodigo"`
	CMECodigo     int    `json:"cmecodigo"`
	BodegaVigente string `json:"bodegavigente"`
	CodigoBodega  int    `json:"codigobodega"`
}
