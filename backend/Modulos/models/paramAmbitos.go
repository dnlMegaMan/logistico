package models

// ParamAmbitos is...
type ParamAmbitos struct {
	PaHDGCodigo int    `json:"hdgcodigo"`
	PaESACodigo int    `json:"esacodigo"`
	PaCMECodigo int    `json:"cmecodigo"`
	PiUsuario   string `json:"usuario"`
	PiServidor  string `json:"servidor"`
}
