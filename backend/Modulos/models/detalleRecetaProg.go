package models

// DetalleRecetaProg is...
type DetalleRecetaProg struct {
	CodMei         string `json:"codmei"`
	MeInDescri     string `json:"meindescri"`
	Dosis          int    `json:"dosis"`
	Formulacion    int    `json:"formulacion"`
	Dias           int    `json:"dias"`
	CantSoli       int    `json:"cantsoli"`
	CantDespachada int    `json:"cantdespachada"`
	CantPendiente  int    `json:"cantpendiente"`
}
