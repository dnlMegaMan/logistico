package models

// PCierreKardexBodega is...
type PCierreKardexBodega struct {
	PiHDGCodigo int    `json:"hdgcodigo"`
	PiESACodigo int    `json:"esacodigo"`
	PiCMECodigo int    `json:"cmecodigo"`
	PiServidor  string `json:"servidor"`
	PiUsuario   string `json:"usuario"`
	PiCodBodega int    `json:"codbodega"`
}
