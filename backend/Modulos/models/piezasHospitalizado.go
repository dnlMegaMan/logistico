package models

// PiezasHospitalizado is...
type PiezasHospitalizado struct {
	HDGCodigo        int    `json:"hdgcodigo"`
	ESACodigo        int    `json:"esacodigo"`
	CMECodigo        int    `json:"cmecodigo"`
	PiezaID          int    `json:"piezaid"`
	PiezaDescripcion string `json:"piezadescripcion"`
}
