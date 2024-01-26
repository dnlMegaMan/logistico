package models

// ParamDespachoReceta is...
type ParamDespachoReceta struct {
	PiServidor   string `json:"servidor"`
	PiUsuario    string `json:"usuario"`
	PiHdgCodigo  int    `json:"hdgcodigo"`
	PiEsaCodigo  int    `json:"esacodigo"`
	PiCmeCodigo  int    `json:"cmecodigo"`
	PiTipoReport string `json:"tiporeport"`
	PiTipo       int    `json:"tipo"`
	PiSoliID     int    `json:"soliid"`
	PiReceID     int    `json:"receid"`
}
