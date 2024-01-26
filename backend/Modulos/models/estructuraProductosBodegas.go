package models

// EstructuraProductosBodegas is...
type EstructuraProductosBodegas struct {
	Accion              string `json:"accion"`
	FboiID              int    `json:"bodid"`
	FboiHdgCodigo       int    `json:"hdgcodigo"`
	FboiMeinID          int    `json:"meinid"`
	FboiCodProducto     string `json:"mameincodmei"`
	FboiPtoAsignacio    int    `json:"ptoasignacion"`
	FboiPtoReorden      int    `json:"ptoreposicion"`
	FboiStocCritico     int    `json:"stockcritico"`
	FboiStocActual      int    `json:"stockactual"`
	FboiNivelReposicion int    `json:"nivelreposicion"`
	GlosaProducto       string `json:"glosaproducto"`
	PrincipioActivo     string `json:"principioactivo"`
	Presentacion        string `json:"presentacion"`
	FormaFarma          string `json:"formafarma"`
	GlosaUnidad         string `json:"glosaunidad"`
	GlosaTipoPoducto    string `json:"glosatipoproducto"`
	ControlMinimo       string `json:"controlminimo"`
	Servidor            string `json:"servidor"`
	Usuario             string `json:"usuario"`
}
