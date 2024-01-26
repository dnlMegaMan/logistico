package models

// ResultConsultaCuenta is...
type ResultConsultaCuenta struct {
	CUENTAID          string `json:"cuentaid"`
	NUMEROCUENTA      string `json:"numerocuenta"`
	NUMIDENTIFICACION string `json:"numidentificacion"`
	NOMPACIENTE       string `json:"nompaciente"`
	EDAD              string `json:"edad"`
	FECINGRESO        string `json:"fecingreso"`
	FECEGRESO         string `json:"fecegreso"`
}
