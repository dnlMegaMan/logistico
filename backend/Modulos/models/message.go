package models

// Message is...
type Message struct {
	HDGCodigo           int     `json:"hdgcodigo"`
	ESACodigo           int     `json:"esacodigo"`
	CMECodigo           int     `json:"cmecodigo"`
	Codigo              string  `json:"codigo"`
	Descripcion         string  `json:"descripcion"`
	Tiporegistro        string  `json:"tiporegistro"`
	Tipomedicamento     int     `json:"tipomedicamento"`
	Valorcosto          float64 `json:"valorcosto"`
	Margen              int     `json:"margenmedicamento"`
	Valorventa          float64 `json:"valorventa"`
	Unidadcompra        int     `json:"unidadcompra"`
	Unidaddespacho      int     `json:"unidaddespacho"`
	Incobfonasa         string  `json:"incobfonasa"`
	Tipoincob           string  `json:"tipoincob"`
	Clasificacion       int     `json:"clasificacion"`
	Recetaretenida      string  `json:"recetaretenida"`
	Estado              int     `json:"estado"`
	Solocompra          string  `json:"solocompra"`
	Familia             int     `json:"familia"`
	Subfamilia          int     `json:"subfamilia"`
	Grupo               int     `json:"grupo"`
	SubGrupo            int     `json:"subgrupo"`
	FechaInicioVigencia string  `json:"fechainiciovigencia"`
	FechaFinVigencia    string  `json:"fechafinvigencia"`
	CodigoPact          int     `json:"codpact"`
	CodigoPres          int     `json:"codpres"`
	CodigoFFar          int     `json:"codffar"`
	Controlado          string  `json:"controlado"`
	PiUsuario           string  `json:"usuario"`
	PiServidor          string  `json:"servidor"`
}
