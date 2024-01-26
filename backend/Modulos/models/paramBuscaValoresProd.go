package models

// ParamBuscaValoresProd is...
type ParamBuscaValoresProd struct {
	PiHDGCodigo  int    `json:"hdgcodigo"`
	PiESACodigo  int    `json:"esacodigo"`
	PiCMECodigo  int    `json:"cmecodigo"`
	ProductoTipo string `json:"productotipo"`
	ProductoDesc string `json:"productodesc"`
	ProductoCodi string `json:"productocodi"`
	PiUsuario    string `json:"usuario"`
	PiServidor   string `json:"servidor"`
}
