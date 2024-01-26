package models

// Producto is...
type Producto struct {
	HDGCodigo        int     `json:"hdgcodigo"`
	ESACodigo        int     `json:"esacodigo"`
	CMECodigo        int     `json:"cmecodigo"`
	UMein            int     `json:"mein"`
	UCodigo          string  `json:"codigo"`
	UDescripcion     string  `json:"descripcion"`
	UTiporegistro    string  `json:"tiporegistro"`
	UTipomedicamento int     `json:"tipomedicamento"`
	UValorcosto      float64 `json:"valorcosto"`
	UMargen          int     `json:"margenmedicamento"`
	UValorventa      float64 `json:"valorventa"`
	UUnidadcompra    int     `json:"unidadcompra"`
	UUnidaddespacho  int     `json:"unidaddespacho"`
	UIncobfonasa     string  `json:"incobfonasa"`
	UTipoincob       string  `json:"tipoincob"`
	UEstado          int     `json:"estado"`
	UClasificacion   int     `json:"clasificacion"`
	URecetaretenida  string  `json:"recetaretenida"`
	USolocompra      string  `json:"solocompra"`
	UPreparados      string  `json:"preparados"`
	UFamilia         int     `json:"familia"`
	USubfamilia      int     `json:"subfamilia"`
	UCodigoPact      int     `json:"codpact"`
	UCodigoPres      int     `json:"codpres"`
	UCodigoFFar      int     `json:"codffar"`
	Controlado       string  `json:"controlado"`
	Descforma        string  `json:"descforma"`
	Descpresentacion string  `json:"descpresentacion"`
	Descprincipio    string  `json:"descprincipio"`
}
