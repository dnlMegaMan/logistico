package models

// ServiciosXBodega is...
type ServiciosXBodega struct {
	HDGCodigo           int    `json:"hdgcodigo"`
	ESACodigo           int    `json:"esacodigo"`
	CMECodigo           int    `json:"cmecodigo"`
	ServicioCodigo      int    `json:"serviciocodigo"`
	ServicioDescripcion string `json:"serviciodescripcion"`
}
