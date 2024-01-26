package models

// PCierreLibroMedControlados is...
type PCierreLibroMedControlados struct {
	PiHDGCodigo            int    `json:"hdgcodigo"`
	PiESACodigo            int    `json:"esacodigo"`
	PiCMECodigo            int    `json:"cmecodigo"`
	PiServidor             string `json:"servidor"`
	PiUsuario              string `json:"usuario"`
	PiFecha                string `json:"fecha"`
	PiCodBodegaControlados int    `json:"codbodegacontrolados"`
}
