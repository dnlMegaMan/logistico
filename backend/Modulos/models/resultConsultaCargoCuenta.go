package models

// ResultConsultaCargoCuenta is...
type ResultConsultaCargoCuenta struct {
	CTAID       string `json:"ctaid"`
	FECHACARGO  string `json:"fechacargo"`
	CODIGO      string `json:"codigo"`
	DESCRIPCION string `json:"descripcion"`
	TIPOCARGO   string `json:"tipocargo"`
}
