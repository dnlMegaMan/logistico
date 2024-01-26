package models

// Bodegasdest is...
type Bodegasdest struct {
	HDGCodigo         int    `json:"hdgcodigo"`
	ESACodigo         int    `json:"esacodigo"`
	CMECodigo         int    `json:"cmecodigo"`
	BodSerCodigo      int    `json:"boddescodigo"`
	BodSerDescripcion string `json:"boddesdescripcion"`
}
