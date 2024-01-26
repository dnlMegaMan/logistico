package models

// BodegasAsignar is...
type BodegasAsignar struct {
	HDGCodigo         int    `json:"hdgcodigo"`
	ESACodigo         int    `json:"esacodigo"`
	CMECodigo         int    `json:"cmecodigo"`
	BodegaCodigo      int    `json:"bodegacodigo"`
	BodegaDescripcion string `json:"bodegadescripcion"`
}
