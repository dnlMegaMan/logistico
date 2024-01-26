package models

// EstructuraRolesUsuarios is...
type EstructuraRolesUsuarios struct {
	SERVIDOR       string          `json:"servidor"`
	IDROL          int             `json:"rolid"`
	HDGCODIGO      int             `json:"hdgcodigo"`
	ESACODIGO      int             `json:"esacodigo"`
	CMECODIGO      int             `json:"cmecodigo"`
	CODIGOROL      string          `json:"codigorol"`
	NOMBREROL      string          `json:"nombrerol"`
	DESCRIPCIONROL string          `json:"descripcionrol"`
	IDUSUARIO      int             `json:"idusuario"`
	ACCION         string          `json:"accion"`
	DETALLE        []RolesUsuarios `json:"detalle"`
}
