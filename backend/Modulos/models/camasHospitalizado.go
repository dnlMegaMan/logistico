package models

// CamasHospitalizado is...
type CamasHospitalizado struct {
	HDGCodigo       int    `json:"hdgcodigo"`
	ESACodigo       int    `json:"esacodigo"`
	CMECodigo       int    `json:"cmecodigo"`
	Camaid          int    `json:"camid"`
	CamaDescripcion string `json:"camadescripcion"`
}
