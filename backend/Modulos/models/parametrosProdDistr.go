package models

// ParametrosProdDistr is...
type ParametrosProdDistr struct {
	PaMeInCod   string `json:"meincod"`
	PaMeInDes   string `json:"meindes"`
	PaHDGCodigo int    `json:"hdgcodigo"`
	PaESACodigo int    `json:"esacodigo"`
	PaCMECodigo int    `json:"cmecodigo"`
	PiUsuario   string `json:"usuario"`
	PiServidor  string `json:"servidor"`
}
