package models

// SaldoLotesBodega is...
type SaldoLotesBodega struct {
	HDGCODIGO        int    `json:"hdgcodigo"`
	CMECODIGO        int    `json:"cmecodigo"`
	IDBODEGA         int    `json:"idbodega"`
	IDPRODUCTO       int    `json:"idproducto"`
	LOTE             string `json:"lote"`
	FECHAVENCIMIENTO string `json:"fechavencimiento"`
	SALDO            int    `json:"saldo"`
}
