package models

// ParamInsertServAsoBodega is...
type ParamInsertServAsoBodega struct {
	PiHDGCodigo int    `json:"hdgcodigo"`
	PiESACodigo int    `json:"esacodigo"`
	PiCMECodigo int    `json:"cmecodigo"`
	CodBodega   int    `json:"codbodega"`
	CodServicio int    `json:"codserbodperi"`
	PiUsuario   string `json:"usuario"`
	PiServidor  string `json:"servidor"`
}
