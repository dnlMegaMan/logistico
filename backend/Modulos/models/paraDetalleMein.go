package models

// ParaDetalleMein is...
type ParaDetalleMein struct {
	PiHDGCodigo int    `json:"hdgcodigo"`
	PiESACodigo int    `json:"esacodigo"`
	PiCMECodigo int    `json:"cmecodigo"`
	PaMeInID    int    `json:"meinid"`
	PiUsuario   string `json:"usuario"`
	PiServidor  string `json:"servidor"`
}
