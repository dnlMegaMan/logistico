package models

// ParamReportePedidoGastoServicio is...
type ParamReportePedidoGastoServicio struct {
	Servidor   string `json:"servidor"`
	Usuario    string `json:"usuario"`
	HdgCodigo  int    `json:"hdgcodigo"`
	EsaCodigo  int    `json:"esacodigo"`
	CmeCodigo  int    `json:"cmecodigo"`
	TipoReport string `json:"tiporeport"`
	FechaDesde string `json:"fechadesde"`
	FechaHasta string `json:"fechahasta"`
}
