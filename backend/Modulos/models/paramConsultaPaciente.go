package models

// ParamConsultaPaciente is...
type ParamConsultaPaciente struct {
	SERVIDOR   string `json:"servidor"`
	CMECODIGO  int    `json:"cmecodigo"`
	FECHADESDE string `json:"fechadesde"`
	FECHAHASTA string `json:"fechahasta"`
	RUT        string `json:"rut"`
	NOMBRE     string `json:"nombre"`
	PATERNO    string `json:"paterno"`
	MATERNO    string `json:"materno"`
}
