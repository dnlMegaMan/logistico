package models

// ParamInformesSolicBod is...
type ParamInformesSolicBod struct {
	PiServidor   string `json:"servidor"`
	PiHdgCodigo  int    `json:"hdgcodigo"`
	PiEsaCodigo  int    `json:"esacodigo"`
	PiCmeCodigo  int    `json:"cmecodigo"`
	PiTipoReport string `json:"tiporeport"`
	PiSoliID     int    `json:"soliid"`
	PiUsuario    string `json:"usuario"`
}
