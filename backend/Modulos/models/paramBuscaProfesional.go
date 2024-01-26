package models

// ParamBuscaProfesional is...
type ParamBuscaProfesional struct {
	Servidor			 string `json:"servidor"`
	CodTipIdentificacion int 	`json:"codtipidentificacion"`
	CliNumIdentificacion string `json:"clinumidentificacion"`
	PaternoProf       	 string `json:"paternoprof"`
	MaternoProf       	 string `json:"maternoprof"`
	NombresProf       	 string `json:"nombresprof"`
}
