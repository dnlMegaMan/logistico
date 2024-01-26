package models

// ParamConsultaCargoCuenta is...
type ParamConsultaCargoCuenta struct {
	SERVIDOR    string `json:"servidor"`
	HDGCODIGO   int    `json:"hdgcodigo"`
	ESACODIGO   int    `json:"esacodigo"`
	CMECODIGO   int    `json:"cmecodigo"`
	CUENTA      string `json:"cuentaid"`
	CODPRODUCTO string `json:"codproducto"`
	PRODUCTO    string `json:"producto"`
	NROSOLICITUD string	`json:"nrosolicitud"`
	FECHADESDE  string `json:"fechadesde"`
	FECHAHASTA  string `json:"fechahasta"`
}
