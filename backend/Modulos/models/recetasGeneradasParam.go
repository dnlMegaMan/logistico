package models

// RecetasGeneradas is...
type RecetasGeneradas struct {
	IDREPORT           int    `json:"idreport"`
	HDGCODIGO          int    `json:"hdgcodigo"`
	ESACODIGO          int    `json:"esacodigo"`
	CMECODIGO          int    `json:"cmecodigo"`
	ESANOMBRE          string `json:"esanombre"`
	SOLIID             int    `json:"soliid"`
	RECEID             int    `json:"receid"`
	FECHACREACION      string `json:"fechacreacion"`
	FECHADESPACHO      string `json:"fechadespacho"`
	TIPORECETA         string `json:"tiporeceta"`
	AMBITORECETA       string `json:"ambitoreceta"`
	ESTADORECETA       string `json:"estadoreceta"`
	CODBODEGA          int    `json:"codbodega"`
	GLSBODEGA          string `json:"glsbodega"`
	FECHAPAGO          string `json:"fechapago"`
	NROCOMPROBANTEPAGO int    `json:"nrocomprobantepago"`
	USUARIOPAGO        string `json:"usuariopago"`
	FECHARPT           string `json:"fecharpt"`
	USUARIO            string `json:"usuario"`
	CODMEIN            string `json:"codmein"`
	MEINDESCRI         string `json:"meindescri"`
	CANTSOLI           int    `json:"cantsoli"`
	CANTDESP           int    `json:"cantdesp"`
	CANTPEND           int    `json:"cantpend"`
	GLSSERVICIO        string `json:"glsservicio"`
	CODSERVICIO        string `json:"codservicio"`
}
