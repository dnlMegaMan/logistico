package models

// ConfirmaStockBodSuministroEntrada is...
type ConfirmaStockBodSuministroEntrada struct {
	Servidor  string `json:"servidor"`
	HDGCodigo int    `json:"hdgcodigo"`
	ESACodigo int    `json:"esacodigo"`
	CMECodigo int    `json:"cmecodigo"`
	Usuario   string `json:"usuario"`
	CodBodega int    `json:"codbodega"`
	CanSoli   int    `json:"cansoli"`
	CodMei    string `json:"codmei"`
}

// ConfirmaStockBodSuministroSalida is...
type ConfirmaStockBodSuministroSalida struct {
	Mensaje   string `json:"mensaje"`
	Permiso   bool   `json:"permiso"`
}