package models

// ParamConsultaLibControlados is...
type ParamConsultaLibControlados struct {
	PiServidor             string `json:"servidor"`
	PiUsuario              string `json:"usuario"`
	PiHdgCodigo            int    `json:"hdgcodigo"`
	PiEsaCodigo            int    `json:"esacodigo"`
	PiCmeCodigo            int    `json:"cmecodigo"`
	PiTipoReport           string `json:"tiporeport"`
	PiLibCID               int    `json:"libcid"`
	PiCodBodegaControlados int    `json:"codbodegacontrolados"`
	PiMeInID               int    `json:"meinid"`
}
