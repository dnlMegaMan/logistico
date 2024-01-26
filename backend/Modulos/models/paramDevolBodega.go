package models

// ParamDevolBodega is...
type ParamDevolBodega struct {
	PiHDGCodigo       int                   `json:"hdgcodigo"`
	PiESACodigo       int                   `json:"esacodigo"`
	PiCMECodigo       int                   `json:"cmecodigo"`
	PiServidor        string                `json:"servidor"`
	PiUsuarioDespacha string                `json:"usuariodespacha"`
	Detalle           []ParamDetDevolBodega `json:"paramdetdevolbodega"`
}

// ParamDetDevolBodega is...
type ParamDetDevolBodega struct {
	PiSoliID            int    `json:"soliid"`
	PiSodeID            int    `json:"sodeid"`
	PiMfDeID            int    `json:"mfdeid"`
	PiCantRecepcionada  int    `json:"cantrecepcionada"`
	PiTotalRecepcionado int    `json:"cantrecepcionado"`
	PiCantDevuelta      int    `json:"cantdevuelta"`
	PiCantidadAdevolver int    `json:"cantidadadevolver"`
	PiLote              string `json:"lote"`
	PiFechaVto          string `json:"fechavto"`
	Consumo             string `json:"consumo"`
}
