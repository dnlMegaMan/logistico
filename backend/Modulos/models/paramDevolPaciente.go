package models

// ParamDevolPaciente is...
type ParamDevolPaciente struct {
	PiHDGCodigo       int                     `json:"hdgcodigo"`
	PiESACodigo       int                     `json:"esacodigo"`
	PiCMECodigo       int                     `json:"cmecodigo"`
	PiServidor        string                  `json:"servidor"`
	PiUsuarioDespacha string                  `json:"usuariodespacha"`
	CtaID             int                     `json:"ctaid"`
	Detalle           []ParamDetDevolPaciente `json:"paramdetdevolpaciente"`
}

// ParamDetDevolPaciente is...
type ParamDetDevolPaciente struct {
	PiSoliID            int    `json:"soliid"`
	PiSodeID            int    `json:"sodeid"`
	PiIDMovimientoDet   int    `json:"idmovimientodet"`
	PiCantDispensada    int    `json:"cantdispensada"`
	PiCantDevuelta      int    `json:"cantdevuelta"`
	PiCantidadAdevolver int    `json:"cantidadadevolver"`
	PiLote              string `json:"lote"`
	PiFechaVto          string `json:"fechavto"`
}
