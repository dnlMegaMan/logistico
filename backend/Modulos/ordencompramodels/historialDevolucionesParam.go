package models

// HistorialDevolucionesEntrada is...
type HistorialDevolucionesEntrada struct {
	HDGCODIGO int    `json:"hdgcodigo"`
	ESACODIGO int    `json:"esacodigo"`
	CMECODIGO int    `json:"cmecodigo"`
	OdmoId    int    `json:"odmoid"`
	Servidor  string `json:"servidor"`
	Fecha     string `json:"fecha"`
	Tipodoc   int    `json:"tipodoc"`
	Nota      int    `json:"nota"`
}

// HistorialDevolucionesSalida is...
type HistorialDevolucionesSalida struct {
	OdmdFecha       string `json:"odmdfecha"`
	OdmdCantidad    int    `json:"odmdcantidad"`
	OdmdResponsable string `json:"odmdresponsable"`
	OdmdNotaCredito int    `json:"odmdnotacredito"`
	Mensaje         string `json:"servidor"`
}
