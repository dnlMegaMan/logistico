package models

// ParametrosDatKardex is...
type ParametrosDatKardex struct {
	PiMovimdet       int    `json:"idmovimdet"`
	PiMovimDevol     int    `json:"idmovimdevol"`
	PiMovimAjustes   int    `json:"idmovimdajustes"`
	PiMovimPrestamos int    `json:"idmovimprestamos"`
	PiMovimDevPtmo   int    `json:"idmovimdevptmo"`
	PiMovimPaciente  int    `json:"ismovimpaciente"`
	PiUsuario        string `json:"usuario"`
	PiServidor       string `json:"servidor"`
}
