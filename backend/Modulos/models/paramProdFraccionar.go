package models

// ParamProdFraccionar is...
type ParamProdFraccionar struct {
	PaHDGCodigo int    `json:"hdgcodigo"`
	PaESACodigo int    `json:"esacodigo"`
	PaCMECodigo int    `json:"cmecodigo"`
	PiMeInIDOri int    `json:"meinidori"`
	PiUsuario   string `json:"usuario"`
	PiServidor  string `json:"servidor"`
	PiBodDesp   int    `json:"boddesp"`
}
