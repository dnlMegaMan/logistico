package models

// paramBusquedaServicioReglas is...
type ParamBusquedaServicioReglas struct {
	PiHDGCodigo      int    `json:"hdgcodigo"`
	PiESACodigo      int    `json:"esacodigo"`
	PiCMECodigo      int    `json:"cmecodigo"`
	PiUsuario        string `json:"usuario"`
	PiServidor       string `json:"servidor"`
	PiAmbito         int    `json:"ambito"`
	PiGlosaServicio  string `json:"glosaservicio"`
	PiCodigoServicio string `json:"codigoservicio"`
}
