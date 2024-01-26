package models

// BodegasxServicio is...
type BodegasxServicio struct {
	HDGCodigo         int    `json:"hdgcodigo"`
	ESACodigo         int    `json:"esacodigo"`
	CMECodigo         int    `json:"cmecodigo"`
	ServicioCodigo    int    `json:"serviciocodigo"`
	BodSerCodigo      int    `json:"boddescodigo"`
	BodSerDescripcion string `json:"boddesdescripcion"`
}
