package models

// ResultConsultaPaciente is...
type ResultConsultaPaciente struct {
	CLIID             string `json:"cliid"`
	NUMIDENTIFICACION string `json:"numidentificacion"`
	NOMPACCOMPLETO    string `json:"nompaccompleto"`
	NOMBRE            string `json:"nombre"`
	APEPATERNO        string `json:"apepaterno"`
	APEMATERNO        string `json:"apematerno"`
	EDAD              string `json:"edad"`
}
