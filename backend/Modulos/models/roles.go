package models

// Roles is...
type Roles struct {
	SERVIDOR       string `json:"servidor"`
	IDROL          int    `json:"rolid"`
	HDGCODIGO      int    `json:"hdgcodigo"`
	ESACODIGO      int    `json:"esacodigo"`
	CMECODIGO      int    `json:"cmecodigo"`
	CODIGOROL      string `json:"codigorol"`
	NOMBREROL      string `json:"nombrerol"`
	DESCRIPCIONROL string `json:"descripcionrol"`
	RolesUsuarios  []Roles `json:"rolesusuarios"`
}
