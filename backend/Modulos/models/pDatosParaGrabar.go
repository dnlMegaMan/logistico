package models

// PDatosParaGrabar is...
type PDatosParaGrabar struct {
	Detalle []DatosParaGrabar `json:"datosparagrabar"`
}

// DatosParaGrabar is...
type DatosParaGrabar struct {
	MeInIDOrig  int    `json:"meinidorig"`
	MeInIDDest  int    `json:"meiniddest"`
	FactorConv  int    `json:"factorconv"`
	CantidOrig  int    `json:"cantidorig"`
	CantidDest  int    `json:"cantiddest"`
	CodBodega   int    `json:"codbodega"`
	PiUsuario   string `json:"usuario"`
	PiServidor  string `json:"servidor"`
	PiHDGCodigo int    `json:"hdgcodigo"`
	PiESACodigo int    `json:"esacodigo"`
	PiCMECodigo int    `json:"cmecodigo"`
	PiLote      string `json:"lote"`
	PiFechavto  string `json:"fechavto"`
}
