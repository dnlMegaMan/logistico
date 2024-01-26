package models

// LogIntegraPedidoFin700 is...
type LogIntegraPedidoFin700 struct {
	HDGCODIGO       int    `json:"hdgcodigo"`
	SERVIDOR        string `json:"servidor"`
	IDSOLICITUD     int    `json:"idsolicitud"`
	TIPO            string `json:"tipo"`
	TIPOBODEGA      string `json:"tipobodega"`
	ESTADOSOLICITUD int    `json:"estadosolicitud"`
}
