package models

// ParamReportePedidoGastoServicio is...
type ParamReportePrestamos struct {
	Servidor   string `json:"servidor"`
	Usuario    string `json:"usuario"`
	ReporteID  int64  `json:"reporteid"`
	PrestamoId int    `json:"prestamo"`
	HdgCodigo  int    `json:"hdgcodigo"`
	EsaCodigo  int    `json:"esacodigo"`
	CmeCodigo  int    `json:"cmecodigo"`
}
