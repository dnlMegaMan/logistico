package models

// ParamAjusteStock is...
type ParamAjusteStock struct {
	BodegaCodigo   int     `json:"bodegacodigo"`
	IDMeIn         int     `json:"idmein"`
	ProductoCodi   string  `json:"productocodi"`
	BodegaStock    int     `json:"bodegastock"`
	BodegaStockNew int     `json:"bodegastocknew"`
	ValorCosto     float64 `json:"valorcosto"`
	ValorCostonew  float64 `json:"valorcostonew"`
	ValorVenta     int     `json:"valorventa"`
	ValorVentanew  int     `json:"valorventanew"`
	Responsable    string  `json:"responsable"`
	FechaAjuste    string  `json:"fechaajuste"`
	TipoMotivoAjus int     `json:"tipomotivoajus"`
	PiUsuario      string  `json:"usuario"`
	PiServidor     string  `json:"servidor"`
}
