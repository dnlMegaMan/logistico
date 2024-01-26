package models

// BodegasDespacho is...
type BodegasDespacho struct {
	HDGCodigo     int    `json:"hdgcodigo"`
	ESACodigo     int    `json:"esacodigo"`
	CMECodigo     int    `json:"cmecodigo"`
	CodBodegaPeri int    `json:"codbodegaperi"`
	DesBodegaPeri string `json:"desbodegaperi"`
}
