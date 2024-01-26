package models

// RolesUsuarios is...
type RolesUsuarios struct {
	SERVIDOR         string `json:"servidor"`
	IDROL            int    `json:"rolid"`
	HDGCODIGO        int    `json:"hdgcodigo"`
	ESACODIGO        int    `json:"esacodigo"`
	CMECODIGO        int    `json:"cmecodigo"`
	CODIGOROL        string `json:"codigorol"`
	NOMBREROL        string `json:"nombrerol"`
	DESCRIPCIONROL   string `json:"descripcionrol"`
	IDUSUARIO        int    `json:"idusuario"`
	ACCION           string `json:"accion"`
	IntFin700        string `json:"intfin700"`
	IntConsultaSaldo string `json:"intconsultasaldo"`
	IntLegado        string `json:"intlegado"`
	IntSisalud       string `json:"intsisalud"`
}
