package models

// GrabaProveedores is...
type GrabaProveedores struct {
	ProveedorID     int     `json:"proveedorid"`
	HDGCodigo       int     `json:"hdgCodigo"`
	NumeroRutProv   int     `json:"numerorutprov"`
	DVRutProv       string  `json:"dvrutprov"`
	DescripcionProv string  `json:"descripcionprov"`
	Giro            string  `json:"giro"`
	DireccionProv   string  `json:"direccionprov"`
	ComunaCodigo    int     `json:"comunacodigo"`
	CiudadCodigo    int     `json:"ciudadcodigo"`
	Telefono        int     `json:"telefono"`
	Telefono2       int     `json:"telefono2"`
	NumFax          int     `json:"numfax"`
	Representante   string  `json:"representante"`
	Diremail        string  `json:"diremail"`
	Observaciones   string  `json:"observaciones"`
	DireccionURL    string  `json:"direccionurl"`
	FacturaElectr   int     `json:"facturaelectr"`
	VigenciaCod     int     `json:"vigenciacod"`
	ContactoProv    string  `json:"contactoprov"`
	Telefono1Contac int     `json:"telefono1contac"`
	Telefono2Contac int     `json:"telefono2contac"`
	FormaPago       int     `json:"formapago"`
	MontoMinFac     float64 `json:"montominfac"`
	PiUsuario       string  `json:"usuario"`
	PiServidor      string  `json:"servidor"`
}
