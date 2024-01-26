package models

// PSelCierreKardexProdBod is...
type PSelCierreKardexProdBod struct {
	PiHDGCodigo int    `json:"hdgcodigo"`
	PiESACodigo int    `json:"esacodigo"`
	PiCMECodigo int    `json:"cmecodigo"`
	PiServidor  string `json:"servidor"`
	PiUsuario   string `json:"usuario"`
	KaDeID      int    `json:"kadeid"`
	CodBodega   int    `json:"codbodega"`
	MeInID      int    `json:"meinid"`
}
