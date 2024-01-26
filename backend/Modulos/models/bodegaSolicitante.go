package models

// BodegaSolicitante is...
type BodegaSolicitante struct {
	HdgCodigo         int    `json:"hdgcodigo"`
	EsaCodigo         int    `json:"esacodigo"`
	CmeCodigo         int    `json:"cmecodigo"`
	BodCodigo         int    `json:"bodcodigo"`
	BodDescripcion    string `json:"boddescripcion"`
	BodModificable    string `json:"bodmodificable"`
	BodEstado         string `json:"bodestado"`
	BodTipoBodega     string `json:"bodtipobodega"`
	BodTipoProducto   string `json:"bodtipoproducto"`
	BodCodigoSolicita int    `json:"bodcodigosolicita"`
	BodCodigoEntrega  int    `json:"bodcodigoentrega"`
	TipoRegOri        int    `json:"tiporegori"`
	BodFraccionable   string `json:"bodfraccionable"`
	BodControlado     string `json:"bodcontrolado"`
}
