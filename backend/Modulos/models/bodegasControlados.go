package models

// BodegasControlados is...
type BodegasControlados struct {
	HDGCodigo            int    `json:"hdgcodigo"`
	ESACodigo            int    `json:"esacodigo"`
	CMECodigo            int    `json:"cmecodigo"`
	CodBodegaControlados int    `json:"codbodegacontrolados"`
	DesBodegaControlados string `json:"desbodegacontrolados"`
}
