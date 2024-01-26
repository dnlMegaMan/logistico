package models

// ValidaCodigoMaMe is...
type ValidaCodigoMaMe struct {
	BodegaInvID     int    `json:"bodegainvid"`
	BodegaCodigo    int    `json:"bodegacodigo"`
	MeInID          int    `json:"meinid"`
	PuntoAsignacion int    `json:"puntoasignacion"`
	PuntoReordena   int    `json:"puntoreordena"`
	StockCritico    int    `json:"stockcritico"`
	StockActual     int    `json:"stockactual"`
	DescripcionMeIn string `json:"descripcionmein"`
	CodigoMein      string `json:"codigomein"`
	Campo           string `json:"campo"`
}
