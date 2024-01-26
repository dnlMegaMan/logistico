package models

// ParamProdFraccio is..
type ParamProdFraccio struct {
	PiHDGCodigo int    `json:"hdgcodigo"`
	PiESACodigo int    `json:"esacodigo"`
	PiCMECodigo int    `json:"cmecodigo"`
	PiBodDesp   int    `json:"boddesp"`
	PiCodMei    string `json:"codmei"`
	PiDescProd  string `json:"descprod"`
	PiUsuario   string `json:"usuario"`
	PiServidor  string `json:"servidor"`
}
