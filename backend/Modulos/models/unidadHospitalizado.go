package models

// UnidadHospitalizado is...
type UnidadHospitalizado struct {
	HDGCodigo       int    `json:"hdgcodigo"`
	ESACodigo       int    `json:"esacodigo"`
	CMECodigo       int    `json:"cmecodigo"`
	ServID          int    `json:"servid"`
	CodServicio     string `json:"codservicio"`
	ServDescripcion string `json:"servdescripcion"`
}
