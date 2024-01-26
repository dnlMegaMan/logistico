package models

// DatosParaEliminar is...
type DatosParaEliminar struct {
	MeInIDOrig int    `json:"meinidorig"`
	MeInIDDest int    `json:"meiniddest"`
	PiUsuario  string `json:"usuario"`
	PiServidor string `json:"servidor"`
}

// PDatosParaEliminar is...
type PDatosParaEliminar struct {
	Detalle []DatosParaEliminar `json:"datosparaeliminar"`
}
