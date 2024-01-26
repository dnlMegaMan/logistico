package models

// MovimientoInterfazPacienteCab is...
type MovimientoInterfazPacienteCab struct {
	ID                 int    `json:"movid"`
	HDGCODIGO          int    `json:"hdgcodigo"`
	ESACODIGO          int    `json:"esacodigo"`
	CMECODIGO          int    `json:"cmecodigo"`
	SOLIID             int    `json:"soliid"`
	FECHA              string `json:"fecha"`
	CODTIPMOV          int    `json:"codtipmov"`
	TIPOMOVIMIENTO     string `json:"tipomovimiento"`
	CODBODEGAORIGEN    int    `json:"codbodegaorigen"`
	BODEGAORIGEN       string `json:"bodegaorigen"`
	CODBODEGADESTINO   int    `json:"codbodegadestino"`
	BODEGADESTINO      string `json:"bodegadestino"`
	RECETA             string `json:"receta"`
	IDENTIFICACION     string `json:"identificacion"`
	PACIENTE           string `json:"paciente"`
	REFERENCIACONTABLE int    `json:"referenciacontable"`
	INTERPESTADO       string `json:"interpestado"`
	INTERPERROR        string `json:"interperror"`
	INTERPFECHA        string `json:"interpfecha"`
	CODSERVICIO        string `json:"codservicio"`
	SERVICIO           string `json:"servicio"`
	CODAMBITO          int    `json:"codambito"`
	AMBITO             string `json:"ambito"`
	CTANUMCUENTA       string `json:"ctanumcuenta"`
}
