package models

// ParamInfAdminSolicPac is...
type ParamInfAdminSolicPac struct {
	PiServidor   string `json:"servidor"`
	PiHdgCodigo  int    `json:"hdgcodigo"`
	PiEsaCodigo  int    `json:"esacodigo"`
	PiCmeCodigo  int    `json:"cmecodigo"`
	PiTipoReport string `json:"tiporeport"`
	PiSoliID     int    `json:"soliid"`
	PiCodAmbito  int    `json:"codambito"`
}
