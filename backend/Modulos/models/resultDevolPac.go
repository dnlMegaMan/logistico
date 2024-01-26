package models

// ResultDevolPac is...
type ResultDevolPac struct {
	NUMSOLICITUD int       `json:"numsolicitud"`
	FECSOLICITUD string    `json:"fecsolicitud"`
	CODSERVICIO  string    `json:"codservicio"`
	PACIENTE     string    `json:"paciente"`
	USUARIOORIG  string    `json:"usuarioorig"`
	USUARIODEVOL string    `json:"usuariodevol"`
	ESTADOSOL    int       `json:"estadosolicitud"`
	MENSAJES     []Mensaje `json:"mensajes"`
	FECDEVOLCION string    `json:"fecdevolucion"`
	NumDocPac    string    `json:"numdocpac"`
	TIPODOC      string    `json:"tipodoc"`
}
