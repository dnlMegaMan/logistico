package models

// BodegasPeri is...
type BodegasPeri struct {
	HDGCodigo     int    `json:"hdgcodigo"`
	ESACodigo     int    `json:"esacodigo"`
	CMECodigo     int    `json:"cmecodigo"`
	CodBodegaPeri int    `json:"codbodegaperi"`
	DesBodegaPeri string `json:"desbodegaperi"`
	CodBodModPeri string `json:"codbodmodperi"`
	DesBodModPeri string `json:"desbodmodperi"`
	CodBodEstPeri string `json:"codbodestperi"`
	DesBodEstPeri string `json:"desbodestperi"`
	CodBodTipPeri string `json:"codbodtipperi"`
	DesBodTipPeri string `json:"desbodtipperi"`
	//CodSerBodPeri int    `json:"codserbodperi"`
	CodSerBodPeri int    `json:"serviciocodigo"`
	DesSerBodPeri string `json:"desserbodperi"`
}
