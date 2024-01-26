package models

// ResultConsultaCuentaBod is...
type ResultConsultaCuentaBod struct {
	CGOID        int    `json:"cgoid"`
	FECHACREA    string `json:"fechacrea"`
	CODMEI       string `json:"codmei"`
	DESMEI       string `json:"desmei"`
	CANTIDAD     int    `json:"cantidad"`
	CANDEVUELTA  int    `json:"candevuelta"`
	CANTSOLI     int    `json:"cantsoli"`
	SOLIID       int    `json:"soliid"`
	DESCSERV     string `json:"descserv"`
	LOTE         string `json:"lote"`
	FECHAVTO     string `json:"fechavto"`
	USUACREACION string `json:"usuacreacion"`
	CUENTA       string `json:"cuenta"`
	ESTADO       string `json:"estado"`
}
