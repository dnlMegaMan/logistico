package models

// ClinServicios is...
type ClinServicios struct {
	HDGCodigo         int    `json:"hdgcodigo"`
	ESACodigo         int    `json:"esacodigo"`
	CMECodigo         int    `json:"cmecodigo"`
	ServicCodigo      int    `json:"servivcodigo"`
	ServivDescripcion string `json:"servicdescripcion"`
}
