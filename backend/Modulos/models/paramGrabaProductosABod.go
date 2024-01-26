package models

// ParamGrabaProductosABod is...
type ParamGrabaProductosABod struct {
	FBoIDBodega     int    `json:"fboidbodega"`
	CodBodega       int    `json:"codbodega"`
	MeInIDProd      int    `json:"meinidprod"`
	PuntoAsigna     int    `json:"puntoasigna"`
	PuntoReordena   int    `json:"puntoreordena"`
	StockCritico    int    `json:"stockcritico"`
	StockActual     int    `json:"stockactual"`
	PiUsuario       string `json:"usuario"`
	PiServidor      string `json:"servidor"`
	NivelReposicion int    `json:"nivelreposicion"`
}
