package models

// BuscaxCodigoDesc is...
type BuscaxCodigoDesc struct {
	MeInID          int     `json:"meinid"`
	CodigoMein      string  `json:"codigomein"`
	DescripcionMeIn string  `json:"descripcionmein"`
	TipoRegMeIn     string  `json:"tiporegmein"`
	TipoMedMeIn     int     `json:"tipomedmein"`
	ValorCosto      float64 `json:"valorcosto"`
	Margen          int     `json:"margen"`
	ValorVenta      int     `json:"valorventa"`
	UnidadCompra    int     `json:"UnidadCompra"`
	UnidadVenta     int     `json:"UnidadVenta"`
	IncobFonasa     string  `json:"incobfonasa"`
	TipoIncob       string  `json:"tipoincob"`
	EstadoMeIn      string  `json:"estadomein"`
	StockActual     int     `json:"stockactual"`
	Campo           string  `json:"campo"`
}
