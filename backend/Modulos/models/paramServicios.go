package models

// ParamServicios is...
type ParamServicios struct {
	PiHDGCodigo     int    `json:"hdgcodigo"`
	PiESACodigo     int    `json:"esacodigo"`
	PiCMECodigo     int    `json:"cmecodigo"`
	PiUsuario       string `json:"usuario"`
	PiServidor      string `json:"servidor"`
	PiAmbito        int    `json:"ambito"`
	PiGlosaServicio string `json:"glosaservicio"`
}

// ParamServicios is...
type ParamServiciosPorBodega struct {
	PiUsuario   string `json:"usuario"`
	PiServidor  string `json:"servidor"`
	PiHDGCodigo int    `json:"hdgcodigo"`
	PiESACodigo int    `json:"esacodigo"`
	PiCMECodigo int    `json:"cmecodigo"`
	PiBodCodigo int    `json:"bodcodigo"`
}
