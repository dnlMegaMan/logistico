package models

// ParamModReglas is...
type ParamModReglas struct {
	PiHDGCodigo        int    `json:"hdgcodigo"`
	PiESACodigo        int    `json:"esacodigo"`
	PiCMECodigo        int    `json:"cmecodigo"`
	PiUsuario          string `json:"usuario"`
	PiServidor         string `json:"servidor"`
	PiCodigoServicio   string `json:"codigoservicio"`
	Bodegacontrolados  int    `json:"bodcontrolados"`
	Bodegaconsignacion int    `json:"bodconsignacion"`
	Bodegainsumos      int    `json:"bodinsumos"`
	Bodegamedicamento  int    `json:"bodmedicamento"`
	Bodegacodigo       int    `json:"bodgeneral"`
}
