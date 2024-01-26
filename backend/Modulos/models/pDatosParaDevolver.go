package models

// PDevolucionFraccionamiento is...
type PDevolucionFraccionamiento struct {
	Servidor  string `json:"servidor"`
	Usuario   string `json:"usuario"`
	HdgCodigo int    `json:"hdgcodigo"`
	EsaCodigo int    `json:"esacodigo"`
	CmeCodigo int    `json:"cmecodigo"`
	CodBodega int    `json:"codbodega"`
	Detalle []DevolucionFraccionamiento `json:"devolucionfraccionamiento"`
}

// DevolucionFraccionamiento is...
type DevolucionFraccionamiento struct {
	FrmoID    		string	`json:"frmoid"`
	CodmeiPadre		string	`json:"codmeipadre"`
	CantidadPadre		int	`json:"cantidadpadre"`
	Factordist 		int	`json:"factordist"`
	CodmeiHijo 		string	`json:"codmeihijo"`
	CantidadHijo  		int	`json:"cantidadhijo"`
	Lote        		string	`json:"lote"`
	Fechavto   		string	`json:"fechavto"`
}
