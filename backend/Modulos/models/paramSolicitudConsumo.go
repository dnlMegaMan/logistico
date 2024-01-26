package models

// ParamSolicitudConsumo is...
type ParamSolicitudConsumo struct {
	PiServidor   string `json:"servidor"`
	PiHdgCodigo  int    `json:"hdgcodigo"`
	PiEsaCodigo  int    `json:"esacodigo"`
	PiCmeCodigo  int    `json:"cmecodigo"`
	PiTipoReport string `json:"tiporeport"`
	PiUsuario    string `json:"usuario"`
	PiSoliID     int    `json:"soliid"`
}
