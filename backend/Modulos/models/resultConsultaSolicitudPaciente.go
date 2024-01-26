package models

// ResultConsultaSolicitudPaciente is...
type ResultConsultaSolicitudPaciente struct {
	NUMSOL        string `json:"numsol"`
	NUMCTA        string `json:"numcta"`
	RUT           string `json:"rut"`
	CODESTADO     string `json:"codestado"`
	FLGESTADO     string `json:"flgestado"`
	FECHACREACION string `json:"fechacreacion"`
}
