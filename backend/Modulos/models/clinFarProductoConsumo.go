package models

// ClinFarProductoConsumo is...
type ClinFarProductoConsumo struct {
	ACCION             string `json:"accion"`
	PRODID             int    `json:"prodid"`
	HDGCODIGO          int    `json:"hdgcodigo"`
	ESACODIGO          int    `json:"esacodigo"`
	CMECODIGO          int    `json:"cmecodigo"`
	PRODCODIGO         string `json:"prodcodigo"`
	PRODDESCRIPCION    string `json:"proddescripcion"`
	GRUPOID            int    `json:"grupoid"`
	SUBGRUPOID         int    `json:"subgrupoid"`
	UNIDADID           int    `json:"unidadid"`
	USUARIO            string `json:"usuario"`
	SERVIDOR           string `json:"servidor"`
	GLOSAUNIDADCONSUMO string `json:"glosaunidadconsumo"`
	GLOSAGRUPO         string `json:"glosagrupo"`
	GLOSASUBGRUPO      string `json:"glosasubgrupo"`
	STOCKACTUAL        int    `json:"stockactual"`
}
