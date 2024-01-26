package models

// ParamInvActualiza is...
type ParamInvActualiza struct {
	IDDetalleInven int    `json:"iddetalleinven"`
	IDInventario   int    `json:"idinventario"`
	IDMeInID       int    `json:"idmeinid"`
	CodigoMeIn     string `json:"codigomein"`
	AjusteInvent   int    `json:"ajusteinvent"`
	StockInvent    int    `json:"stockinvent"`
	ConteoManual   int    `json:"conteomanual"`
	ProductoDesc   string `json:"productodesc"`
	PiUsuario      string `json:"usuario"`
	PiServidor     string `json:"servidor"`
}
