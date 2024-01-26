package models

// TraeAjustesBod is...
type TraeAjustesBod struct {
	BodegaCodigo    int     `json:"bodegacodigo"`
	BodegaDescri    string  `json:"bodegadescri"`
	ProductoCodi    string  `json:"productocodi"`
	ProductoDesc    string  `json:"productodesc"`
	BodegaStock     int     `json:"bodegastock"`
	BodegaStockNew  int     `json:"bodegastocknew"`
	ValorCosto      float64 `json:"valorcosto"`
	ValorCostonew   float64 `json:"valorcostonew"`
	ValorVenta      int     `json:"valorventa"`
	ValorVentanew   int     `json:"valorventanew"`
	Responsable     string  `json:"responsable"`
	FechaAjuste     string  `json:"fechaajuste"`
	TipoMotivoAjusC int     `json:"tipomotivoajusc"`
	TipoMotivoAjusD string  `json:"tipomotivoajusd"`
}
