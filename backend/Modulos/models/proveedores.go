package models

// Proveedores is...
type Proveedores struct {
	ProveedorID      int                          `json:"proveedorid"`
	NumeroRutProv    int                          `json:"numerorutprov"`
	DVRutProv        string                       `json:"dvrutprov"`
	DescripcionProv  string                       `json:"descripcionprov"`
	DireccionProv    string                       `json:"direccionprov"`
	ContactoProv     string                       `json:"contactoprov"`
	FormaPago        int                          `json:"formapago"`
	MontoMinFac      float64                      `json:"montominfac"`
	Giro             string                       `json:"giro"`
	Telefono         int                          `json:"telefono"`
	Telefono2        int                          `json:"telefono2"`
	Diremail         string                       `json:"diremail"`
	CiudadCodigo     int                          `json:"ciudadcodigo"`
	CiudadDes        string                       `json:"ciudaddescripcion"`
	ComunaCodigo     int                          `json:"comunacodigo"`
	ComunaDes        string                       `json:"comunadesdescripcion"`
	PaisCodigo       int                          `json:"paiscodigo"`
	PaisDes          string                       `json:"paisdescripcion"`
	RegionCodigo     int                          `json:"regioncodigo"`
	RegionDes        string                       `json:"regiondesdescripcion"`
	FormaPagoDes     string                       `json:"formapagodes"`
	Representante    string                       `json:"representante"`
	FacturaElectr    string                       `json:"facturaelectr"`
	DireccionURL     string                       `json:"direccionurl"`
	Observaciones    string                       `json:"observaciones"`
	VigenciaCod      int                          `json:"vigenciacod"`
	VigenciaDes      string                       `json:"vigenciades"`
	Telefono1Contac  int                          `json:"telefono1contac"`
	Telefono2Contac  int                          `json:"telefono2contac"`
	FacturaElectrDes string                       `json:"facturaelectrdes"`
	Detalle          []DetalleArticulosProvSalida `json:"provdetalle"`
	Servidor         string                       `json:"servidor"`
	ListaMein        string                       `json:"listamein"`
}

type DetalleArticulosProvSalida struct {
	MeinId int `json:"meinid"`
	Plazo  int `json:"plazo"`
}
