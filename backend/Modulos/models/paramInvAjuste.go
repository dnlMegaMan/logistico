package models

// ParamInvAjuste is...
type ParamInvAjuste struct {
	IDDetalleInven int     `json:"iddetalleinven"`
	IDInventario   int     `json:"idinventario"`
	IDMeInID       int     `json:"idmeinid"`
	CodigoMeIn     string  `json:"codigomein"`
	AjusteInvent   int     `json:"ajusteinvent"`
	StockInvent    int     `json:"stockinvent"`
	ConteoManual   int     `json:"conteomanual"`
	ProductoDesc   string  `json:"productodesc"`
	ValorCosto     float64 `json:"valorcosto"`
	BodegaInv      int     `json:"bodegainv"`
	Responsable    string  `json:"responsable"`
	TipoMotivoAjus int     `json:"tipomotivoajus"`
	EstadoAjuste   string  `json:"estadoajuste"`
	PiUsuario      string  `json:"usuario"`
	PiServidor     string  `json:"servidor"`
}
