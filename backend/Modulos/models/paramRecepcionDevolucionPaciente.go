package models


// ParamRecepcionDevolucionPaciente is...
type ParamRecepcionDevolucionPaciente struct {
	PiServidor   string `json:"servidor"`
	PiHDGCodigo  int    `json:"hdgcodigo"`
	PiESACodigo  int    `json:"esacodigo"`
	PiCMECodigo  int    `json:"cmecodigo"`
	CodBodega    int    `json:"codbodega"`
	CodServicio  string	`json:"codservicio"`
	SoliID  	 int    `json:"soliid"`
	NomPac  	 string	`json:"nompac"`
	ApePaterPac	 string	`json:"apepaterpac"`
	ApeMaterPac	 string	`json:"apematerpac"`
	TipoDocPac 	 int    `json:"tipodoc"`
	IdenPac    	 string	`json:"idenpac"`
	FecDesde  	 string	`json:"fecdesde"`
	FecHasta  	 string	`json:"fechasta"`
}