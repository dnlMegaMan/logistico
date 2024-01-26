package models

// ResultConsultaSolicitud is...
type ResultConsultaSolicitud struct {
	CTAID       int    `json:"ctaid"`
	NUMSOL      string `json:"numsol"`
	FECHACARGO  string `json:"fechacargo"`
	CODIGO      string `json:"codigo"`
	DESCRIPCION string `json:"descripcion"`
	TIPOCARGO   string `json:"tipocargo"`
}
