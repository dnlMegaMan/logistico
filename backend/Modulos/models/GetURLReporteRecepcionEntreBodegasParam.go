package models

type GetURLReporteRecepcionEntreBodegasRequest struct {
	HdgCodigo   int    `json:"hdgcodigo"`
	EsaCodigo   int    `json:"esacodigo"`
	CmeCodigo   int    `json:"cmecodigo"`
	TipoReport  string `json:"tipoReporte"`
	SolicitudId int    `json:"solicitudId"`
	Servidor    string `json:"servidor"`
	Usuario     string `json:"usuario"`
}
