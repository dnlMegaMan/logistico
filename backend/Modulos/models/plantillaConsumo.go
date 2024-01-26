package models

// PlantillaConsumo is...
type PlantillaConsumo struct {
	ACCION              string                    `json:"accion"`
	ID                  int                       `json:"id"`
	HDGCODIGO           int                       `json:"hdgcodigo"`
	ESACODIGO           int                       `json:"esacodigo"`
	CMECODIGO           int                       `json:"cmecodigo"`
	CENTROCOSTO         int                       `json:"centrocosto"`
	IDPRESUPUESTO       int                       `json:"idpresupuesto"`
	GLOSA               string                    `json:"glosa"`
	REFERENCIACONTABLE  int                       `json:"referenciacontable"`
	OPERACIONCONTABLE   int                       `json:"operacioncontable"`
	ESTADO              int                       `json:"estado"`
	CODMEI				string                    `json:"codmei"`
	DETPLANTILLACONSUMO []DetallePlantillaConsumo `json:"detplantillaconsumo"`
	USUARIO             string                    `json:"usuario"`
	SERVIDOR            string                    `json:"servidor"`
	FECHADESDE          string                    `json:"fechadesde"`
	FECHAHASTA          string                    `json:"fechahasta"`
	GLOSACENTROCOSTO    string                    `json:"glosacentrocosto"`
	GLOSAESTADO         string                    `json:"glosaestado"`
}

// DetallePlantillaConsumo is...
type DetallePlantillaConsumo struct {
	ACCION             string `json:"accion"`
	IDDETAELLE         int    `json:"iddetalle"`
	ID                 int    `json:"id"`
	CENTROCOSTO        int    `json:"centrocosto"`
	IDPRESUPUESTO      int    `json:"idpresupuesto"`
	IDPRODUCTO         int    `json:"idproducto"`
	CODIGOPRODUCTO     string `json:"codigoproducto"`
	GLOSAPRODUCTO      string `json:"glosaproducto"`
	CANTIDADSOLICITADA int    `json:"cantidadsolicitada"`
	REFERENCIACONTABLE int    `json:"referenciacontable"`
	OPERACIONCONTABLE  int    `json:"operacioncontable"`
	ESTADO             int    `json:"estado"`
	USUARIO            string `json:"usuario"`
	SERVIDOR           string `json:"servidor"`
	GLOSAUNIDADCONSUMO string `json:"glosaunidadconsumo"`
}
