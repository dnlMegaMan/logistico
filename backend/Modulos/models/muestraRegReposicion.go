package models

// MuestraRegReposicion is...
type MuestraRegReposicion struct {
	CodMeinID             int     `json:"codmeinid"`
	CodigoMein            string  `json:"codigomein"`
	DescripcionMeIn       string  `json:"descripcionmein"`
	CantidadReal          int     `json:"cantidadareponer"`
	MFDEID                int     `json:"mfdeid"`
	FechaMov              string  `json:"fechamov"`
	ValorCosto            float64 `json:"valorcosto"`
	StockActual           int     `json:"stockactual"`
	StockCritico          int     `json:"stockcritico"`
	StockBodegaSuministro int     `json:"stocksuministro"`
	NivelReposicion       int     `json:"nivelreposicion"`
	TipoReposicion        int     `json:"tiporeposicion"`
}
