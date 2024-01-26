package models

// PSelCierreLibroMedControlados is...
type PSelCierreLibroMedControlados struct {
	PiHDGCodigo          int    `json:"hdgcodigo"`
	PiESACodigo          int    `json:"esacodigo"`
	PiCMECodigo          int    `json:"cmecodigo"`
	PiServidor           string `json:"servidor"`
	PiUsuario            string `json:"usuario"`
	LibCID               int    `json:"libcid"`
	CodBodegaControlados int    `json:"codbodegacontrolados"`
	MeInID               int    `json:"meinid"`
}
