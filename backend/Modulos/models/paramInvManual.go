package models

// ParamInvManual is...
type ParamInvManual struct {
	IDDetalleInven int    `json:"iddetalleinven"`
	IDInventario   int    `json:"idinventario"`
	IDMeInID       int    `json:"idmeinid"`
	CodigoMeIn     string `json:"codigomein"`
	AjusteInvent   int    `json:"ajusteinvent"`
	StockInvent    int    `json:"stockinvent"`
	ConteoManual1  *int   `json:"conteomanual1"`
	ConteoManual2  *int   `json:"conteomanual2"`
	ConteoManual3  *int   `json:"conteomanual3"`
	ProductoDesc   string `json:"productodesc"`
	PiUsuario      string `json:"usuario"`
	CMECodigo      int    `json:"cmecodigo"`
	ESACodigo      int    `json:"esacodigo"`
	HDGCodigo      int    `json:"hdgcodigo"`
}
