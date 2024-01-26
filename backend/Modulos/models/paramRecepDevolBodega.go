package models

// ParamRecepDevolBodega is...
type ParamRecepDevolBodega struct {
	PiHDGCodigo       int                        `json:"hdgcodigo"`
	PiESACodigo       int                        `json:"esacodigo"`
	PiCMECodigo       int                        `json:"cmecodigo"`
	PiServidor        string                     `json:"servidor"`
	PiUsuarioDespacha string                     `json:"usuariodespacha"`
	PiSoliID          int                        `json:"soliid"`
	SOLIBODORIGEN     int                        `json:"solibodorigen"`
	SOLIBODDESTINO    int                        `json:"soliboddestino"`
	Detalle           []ParamDetRecepDevolBodega `json:"paramdetdevolbodega"`
}
