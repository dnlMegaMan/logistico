package models

// ParamConsultaRecetaProg is...
type ParamConsultaRecetaProg struct {
	PiServidor   string `json:"servidor"`
	PiUsuario    string `json:"usuario"`
	PiHdgCodigo  int    `json:"hdgcodigo"`
	PiEsaCodigo  int    `json:"esacodigo"`
	PiCmeCodigo  int    `json:"cmecodigo"`
	PiTipoReport string `json:"tiporeport"`
	PCliID       int    `json:"cliid"`
}
