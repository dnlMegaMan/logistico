package models

// ParamTraeServicios is...
type ParamTraeServicios struct {
	PiHDGCodigo  int    `json:"hdgcodigo"`
	PiESACodigo  int    `json:"esacodigo"`
	PiCMECodigo  int    `json:"cmecodigo"`
	BodegaCodigo int    `json:"bodegacodigo"`
	PiUsuario    string `json:"usuario"`
	PiServidor   string `json:"servidor"`
}
