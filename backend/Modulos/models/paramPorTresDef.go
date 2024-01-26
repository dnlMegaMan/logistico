package models

// ParamPorTresDef is...
type ParamPorTresDef struct {
	PiHDGCodigo    int    `json:"hdgcodigo"`
	PiESACodigo    int    `json:"esacodigo"`
	PiCMECodigo    int    `json:"cmecodigo"`
	PiPrincActivo  int    `json:"princactivo"`
	PiPresentacion int    `json:"presentacion"`
	PiFormaFarma   int    `json:"FormaFarma"`
	PiUsuario      string `json:"usuario"`
	PiServidor     string `json:"servidor"`
}
