package models

// PDetMovimientosFarmacia is...
type PDetMovimientosFarmacia struct {
	PiCantidadAdevolver int    `json:"cantidadadevolver"`
	PiTipoReg           string `json:"tiporeg"`
	PiCodMei            string `json:"codmei"`
	PiMeInID            int    `json:"meinid"`
	PiLote              string `json:"lote"`
	PiFechaVto          string `json:"fechavto"`
	PiIDMotivo          int    `json:"idtipomotivo"`
}
