package models

// ParamConsultaCierreKardex is...
type ParamConsultaCierreKardex struct {
	PiServidor   string `json:"servidor"`
	PiUsuario    string `json:"usuario"`
	PiHdgCodigo  int    `json:"hdgcodigo"`
	PiEsaCodigo  int    `json:"esacodigo"`
	PiCmeCodigo  int    `json:"cmecodigo"`
	PiTipoReport string `json:"tiporeport"`
	PiCKarID     int    `json:"ckarid"`
	PiCodBodega  int    `json:"codbodega"`
	PiMeInID     int    `json:"meinid"`
}
