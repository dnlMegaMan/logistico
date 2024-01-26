package models

// ParamMonitorERP is...
type ParamMonitorERP struct {
	PiServidor   string `json:"servidor"`
	PiUsuario    string `json:"usuario"`
	PiHdgCodigo  int    `json:"hdgcodigo"`
	PiEsaCodigo  int    `json:"esacodigo"`
	PiCmeCodigo  int    `json:"cmecodigo"`
	PiTipoReport string `json:"tiporeport"`
	PiPlanID     int    `json:"planid"`
	PiPlanTipo   int    `json:"plantipo"`
}
