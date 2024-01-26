package models

// BodegasServicios is...
type BodegasServicios struct {
	HDGCodigo         int    `json:"hdgcodigo"`
	ESACodigo         int    `json:"esacodigo"`
	CMECodigo         int    `json:"cmecodigo"`
	BodSerCodigo      int    `json:"bodsercodigo"`
	BodSerDescripcion string `json:"bodserdescripcion"`
}
