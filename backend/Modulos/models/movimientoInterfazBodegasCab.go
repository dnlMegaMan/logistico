package models

// MovimientoInterfazBodegasCab is...
type MovimientoInterfazBodegasCab struct {
	ID                 int    `json:"id"`
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
	REFERENCIACONTABLE int    `json:"referenciacontable"`
	INTERPESTADO       string `json:"interpestado"`
	INTERPERROR        string `json:"interperror"`
	AGRUPADOR          int    `json:"agrupador"`
}
