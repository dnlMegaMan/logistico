package models

// Medinsu is...
type Medinsu struct {
	HDGCodigo           int     `json:"hdgcodigo"`
	ESACodigo           int     `json:"esacodigo"`
	CMECodigo           int     `json:"cmecodigo"`
	UMein               int     `json:"mein"`
	UCodigo             string  `json:"codigo"`
	UDescripcion        string  `json:"descripcion"`
	CodigoCum           string  `json:"mein_codigo_cum"`
	RegistroInvima      string  `json:"mein_registro_invima"`
	UTiporegistro       string  `json:"tiporegistro"`
	UTipomedicamento    int     `json:"tipomedicamento"`
	UValorcosto         float64 `json:"valorcosto"`
	UMargen             int     `json:"margenmedicamento"`
	UValorventa         float64 `json:"valorventa"`
	UUnidadcompra       int     `json:"unidadcompra"`
	UUnidaddespacho     int     `json:"unidaddespacho"`
	UIncobfonasa        string  `json:"incobfonasa"`
	UTipoincob          string  `json:"tipoincob"`
	UEstado             int     `json:"estado"`
	UClasificacion      int     `json:"clasificacion"`
	URecetaretenida     string  `json:"recetaretenida"`
	USolocompra         string  `json:"solocompra"`
	UPreparados         string  `json:"preparados"`
	UFamilia            int     `json:"familia"`
	USubfamilia         int     `json:"subfamilia"`
	UGrupo              int     `json:"grupo"`
	USubGrupo           int     `json:"subgrupo"`
	UCodigoPact         int     `json:"codpact"`
	UCodigoPres         int     `json:"codpres"`
	UCodigoFFar         int     `json:"codffar"`
	Controlado          string  `json:"controlado"`
	Campo               string  `json:"campo"`
	PoPrincipioActivo   string  `json:"principioactivo"`
	PoPresentacion      string  `json:"presentacion"`
	PoFormaFarma        string  `json:"formafarma"`
	PoDesUnidaddespacho string  `json:"desunidaddespacho"`
	Consignacion        string  `json:"consignacion"`
	DescTipoRegistro    string  `json:"desctiporegistro"`
	FechaInicioVigencia string  `json:"fechainiciovigencia"`
	FechaFinVigencia    string  `json:"fechafinvigencia"`
	Saldo               int     `json:"saldo"`
	// Lote                string  `json:"lote"`
	// SaldoLote           int     `json:"saldolote"`
	Mensaje  string `json:"mensaje"`
	Vigencia bool   `json:"vigencia"`
}
