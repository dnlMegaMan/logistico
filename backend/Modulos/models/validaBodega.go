package models

// ValidaBodega is...
type ValidaBodega struct {
	CodBodega     int    `json:"codbodega"`
	DesBodega     string `json:"desbodega"`
	ExisteBodega  string `json:"existebodega"`
	CodServicio   int    `json:"codserbodperi"`
	DesServicio   string `json:"desserbodperi"`
	CodBodEstPeri string `json:"codbodestperi"`
	DesBodEstPeri string `json:"desbodestperi"`
}
