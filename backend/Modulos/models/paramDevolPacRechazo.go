package models

// ParamDevolPacRechazo is...
type ParamDevolPacRechazo struct {
	PiHDGCodigo       int                       `json:"hdgcodigo"`
	PiESACodigo       int                       `json:"esacodigo"`
	PiCMECodigo       int                       `json:"cmecodigo"`
	PiServidor        string                    `json:"servidor"`
	PiUsuarioDespacha string                    `json:"usuariodespacha"`
	PiUsuarioRechaza  string                    `json:"usuariorechaza"`
	CtaID             int                       `json:"ctaid"`
	CodAmbito         int                       `json:"codambito"`
	Detalle           []ParamDetDevolPacRechazo `json:"paramdetdevolpaciente"`
}

// ParamDetDevolPaciente is...
type ParamDetDevolPacRechazo struct {
	PiSoliID            int    `json:"soliid"`
	PiSodeID            int    `json:"sodeid"`
	PiCodMei            string `json:"codmei"`
	PiIDMovimientoDet   int    `json:"idmovimientodet"`
	PiCantDispensada    int    `json:"cantdispensada"`
	PiCantDevuelta      int    `json:"cantdevuelta"`
	PiCantidadAdevolver int    `json:"cantidadadevolver"`
	PiCantidadARechazar int    `json:"cantidadarechazar"`
	PiObservacion       string `json:"observaciones"`
	PiEstadoRechazo     int    `json:"codtiporechazo"`
	PiLote              string `json:"lote"`
	PiFechaVto          string `json:"fechavto"`
}

// ParamDevolPacRechazoTrans is...
type ParamDevolPacRechazoTrans struct {
	PiHDGCodigo         int    `json:"hdgcodigo"`
	PiESACodigo         int    `json:"esacodigo"`
	PiCMECodigo         int    `json:"cmecodigo"`
	PiServidor          string `json:"servidor"`
	PiUsuarioDespacha   string `json:"usuariodespacha"`
	PiUsuarioRechaza    string `json:"usuariorechaza"`
	CtaID               int    `json:"ctaid"`
	CodAmbito           int    `json:"codambito"`
	PiSoliID            int    `json:"soliid"`
	PiSodeID            int    `json:"sodeid"`
	PiCodMei            string `json:"codmei"`
	PiIDMovimientoDet   int    `json:"idmovimientodet"`
	PiCantDispensada    int    `json:"cantdispensada"`
	PiCantDevuelta      int    `json:"cantdevuelta"`
	PiCantidadAdevolver int    `json:"cantidadadevolver"`
	PiCantidadARechazar int    `json:"cantidadarechazar"`
	PiObservacion       string `json:"observaciones"`
	PiEstadoRechazo     int    `json:"codtiporechazo"`
	PiLote              string `json:"lote"`
	PiFechaVto          string `json:"fechavto"`
}
