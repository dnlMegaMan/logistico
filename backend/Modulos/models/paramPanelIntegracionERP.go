package models

// ParamPanelIntegracionERP is...
type ParamPanelIntegracionERP struct {
	PiServidor   string `json:"servidor"`
	PiHdgCodigo  int    `json:"hdgcodigo"`
	PiEsaCodigo  int    `json:"esacodigo"`
	PiCmeCodigo  int    `json:"cmecodigo"`
	PiUsuario    string `json:"usuario"`
	PiTipoReport string `json:"tiporeport"`
	PiFechaDesde string `json:"fechadesde"`
	PifechaHasta string `json:"fechahasta"`
	PiSoliID     int    `json:"soliid"`
	PiSoliCon    int    `json:"solicon"`
	PiTipo       int    `json:"tipo"`
}
