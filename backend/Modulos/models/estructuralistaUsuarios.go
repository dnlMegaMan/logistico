package models

// EstructuralistaUsuarios is...
type EstructuralistaUsuarios struct {
	USUAID          int    `json:"userid"`
	USUAUSERNAME    string `json:"usercode"`
	USUANOMBRE      string `json:"username"`
	USUAHDGCODIGO   int    `json:"hdgcodigo"`
	USUAESACODIGO   int    `json:"esacodigo"`
	USUACMECODIGO   int    `json:"cmecodigo"`
	USUARUT         string `json:"userrut"`
	USUACCOSTO      int    `json:"ccosto"`
	USUAUNIDAD      string `json:"unidad"`
	USUASERVICIO    string `json:"servicio"`
	USUAFECCREACION string `json:"fechacreacion"`
	USUAFECTERMINO  string `json:"fechatermino"`
}
