package models

// ParamTraeCamas is...
type ParamTraeCamas struct {
	PiHDGCodigo int    `json:"hdgcodigo"`
	PiESACodigo int    `json:"esacodigo"`
	PiCMECodigo int    `json:"cmecodigo"`
	PIdPieza    int    `json:"idpieza"`
	PiUsuario   string `json:"usuario"`
	PiServidor  string `json:"servidor"`
}
