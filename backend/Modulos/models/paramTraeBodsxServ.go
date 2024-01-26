package models

// ParamTraeBodsxServ is...
type ParamTraeBodsxServ struct {
	PiHDGCodigo    int    `json:"hdgcodigo"`
	PiESACodigo    int    `json:"esacodigo"`
	PiCMECodigo    int    `json:"cmecodigo"`
	ServicioCodigo int    `json:"serviciocodigo"`
	PiUsuario      string `json:"usuario"`
	PiServidor     string `json:"servidor"`
}
