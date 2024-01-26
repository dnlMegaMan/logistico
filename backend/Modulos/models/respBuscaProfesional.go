package models

// RespBuscaProfesional is...
type RespBuscaProfesional struct {
	CodTipIdentificacion int 	`json:"codtipidentificacion"`
	CliNumIdentificacion string `json:"clinumidentificacion"`
	NombreProf	     string `json:"nombreprof"`
	PaternoProf	     string `json:"paternoprof"`
	MaternoProf	     string `json:"maternoprof"`
	Especialidad         string `json:"especialidad"`
	RolProfesional       string `json:"rolprofesional"`
}
