package models

// DetalleInventario is...
type DetalleInventario struct {
	IDDetalleInven       int     `json:"iddetalleinven"`
	IDInventario         int     `json:"idinventario"`
	IDMeInID             int     `json:"idmeinid"`
	CodigoMeIn           string  `json:"codigomein"`
	AjusteInvent         int     `json:"ajusteinvent"`
	StockInvent          int     `json:"stockinvent"`
	HabilitarConteo      int     `json:"habilitarconteo"`
	ConteoManual1        *int    `json:"conteomanual1"`
	ConteoManual2        *int    `json:"conteomanual2"`
	ConteoManual3        *int    `json:"conteomanual3"`
	ActualizacionConteo1 string  `json:"actualizacionconteo1"`
	ActualizacionConteo2 string  `json:"actualizacionconteo2"`
	ActualizacionConteo3 string  `json:"actualizacionconteo3"`
	UserIdCierre1        int     `json:"useridcierre1"`
	UserIdCierre2        int     `json:"useridcierre2"`
	UserIdCierre3        int     `json:"useridcierre3"`
	ProductoDesc         string  `json:"productodesc"`
	FechaCierre          *string `json:"fechacierre"`
	ValorCosto           float64 `json:"valorcosto"`
	EstadoAjuste         string  `json:"estadoajuste"`
	Campo                string  `json:"campo"`
	TipoMotivoAjus       int     `json:"tipomotivoajus"`
	TipoMotivoAjusDes    string  `json:"tipomotivoajusdes"`
	CodCusm              string  `json:"codigocums"`
	Lote                 string  `json:"lote"`
	FechaVencimiento     string  `json:"fechavencimiento"`
	Concentracion        string  `json:"concentracion"`
	FormaFarma           string  `json:"formafarma"`
	UnidadMedida         string  `json:"unidadmedida"`
}
