package models

// Fin700Movimiento is...
type Fin700Movimiento struct {
	HDGCODIGO        int    `json:"hdgcodigo"`
	SERVIDOR         string `json:"servidor"`
	TIPOMOVIMIENTO   int    `json:"tipomovimiento"`
	NUMEROMOVIMIENTO int    `json:"numeromovimiento"`
	IDAGRUPADOR      int    `json:"idagrupador"`
}
