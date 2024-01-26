package models

// BodegasFraccionable is...
type BodegasFraccionables struct {
	HDGCodigo     int    `json:"hdgcodigo"`
	ESACodigo     int    `json:"esacodigo"`
	CMECodigo     int    `json:"cmecodigo"`
	CodBodegaFrac int    `json:"codbodegafrac"`
	DesBodegaFrac string `json:"desbodegafrac"`
}