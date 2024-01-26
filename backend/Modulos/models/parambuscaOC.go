package models

// ParambuscaOC is...
type ParambuscaOC struct {
	PiHDGCodigo  int    `json:"hdgcodigo"`
	PiESACodigo  int    `json:"esacodigo"`
	PiCMECodigo  int    `json:"cmecodigo"`
	PiEstadoOC   int    `json:"estadooc"`
	PiFechaDesde string `json:"fechadesde"`
	PiFechaHasta string `json:"fechahasta"`
	PiUsuario    string `json:"usuario"`
	PiServidor   string `json:"servidor"`
}
