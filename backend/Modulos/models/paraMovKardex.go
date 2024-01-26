package models

// ParaMovKardex is...
type ParaMovKardex struct {
	PiHDGCodigo int    `json:"hdgcodigo"`
	PiESACodigo int    `json:"esacodigo"`
	PiCMECodigo int    `json:"cmecodigo"`
	PiPeriodo   string `json:"periodo"`
	PiCodigo    string `json:"codigo"`
	PiBodega    int    `json:"bodegavigente"`
	PiUsuario   string `json:"usuario"`
	PiServidor  string `json:"servidor"`
}
