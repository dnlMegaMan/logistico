package models

// ParamConsultaCuenta is...
type ParamConsultaCuenta struct {
	SERVIDOR          string `json:"servidor"`
	HDGCODIGO         int    `json:"hdgcodigo"`
	ESACODIGO         int    `json:"esacodigo"`
	CMECODIGO         int    `json:"cmecodigo"`
	CLIID             string `json:"cliid"`
	FECHADESDE        string `json:"fechadesde"`
	FECHAHASTA        string `json:"fechahasta"`
	RUT               string `json:"rut"`
	NOMBRE            string `json:"nombre"`
	PATERNO           string `json:"paterno"`
	MATERNO           string `json:"materno"`
	CUENTA            string `json:"folio"`
	SUBCUENTA         string `json:"ficha"`
	NROSOLICITUD      string `json:"nrosolicitud"`
	NRORECETA         string `json:"nroreceta"`
	CODPRODUCTO       string `json:"codproducto"`
	PRODUCTO          string `json:"producto"`
	TIPIDENTIFICACION int    `json:"tipidentificacion"`
	CODBODEGA         int    `json:"codbodega"`
	NUMCUENTA         int    `json:"numcuenta"`
	NUMSUBCUENTA      int    `json:"numsubcuenta"`
}
