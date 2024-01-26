package models

// ParPeriMedControlados is...
type ParPeriMedControlados struct {
	PiHDGCodigo            int    `json:"hdgcodigo"`
	PiESACodigo            int    `json:"esacodigo"`
	PiCMECodigo            int    `json:"cmecodigo"`
	PiServidor             string `json:"servidor"`
	PiUsuario              string `json:"usuario"`
	PiCodBodegaControlados int    `json:"codbodegacontrolados"`
}
