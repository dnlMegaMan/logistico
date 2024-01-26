package models

// ParamProductosxAsignarABod is...
type ParamProductosxAsignarABod struct {
	PiHDGCodigo  int    `json:"hdgcodigo"`
	PiESACodigo  int    `json:"esacodigo"`
	PiCMECodigo  int    `json:"cmecodigo"`
	CodBodega    int    `json:"codbodega"`
	MeInDesProd  string `json:"meindesprod"`
	MeInCodProd  string `json:"meincodprod"`
	MeInTipoProd string `json:"meintipoprod"`
	PiUsuario    string `json:"usuario"`
	PiServidor   string `json:"servidor"`
}
