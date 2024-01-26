package models

// Cabeceraoc is...
type Cabeceraoc struct {
	OrCoID           int    `json:"orcoid"`
	HDGCodigo        int    `json:"hdgcodigo"`
	ESACodigo        int    `json:"esacodigo"`
	CMECodigo        int    `json:"cmecodigo"`
	ProveedorID      int    `json:"proveedorid"`
	NumeroDocOC      int    `json:"numerodococ"`
	FechaDocOC       string `json:"fechadococ"`
	CantidadItem     int    `json:"cantidaditem"`
	EstadoOC         int    `json:"estadooc"`
	FechaAnulacionOC string `json:"fechaanulacionoc"`
	NumeroRutProv    int    `json:"numerorutprov"`
	DvRutProv        string `json:"dvrutprov"`
	DescripcionProv  string `json:"descripcionprov"`
	DireccionProv    string `json:"direccionprov"`
	ContactoProv     string `json:"contactoprov"`
	FormaPago        int    `json:"formapago"`
	MontoMinFac      int    `json:"montominfac"`
	DescEstadoOC     string `json:"descestadooc"`
	FechaEmisionoc   string `json:"fechaemisionoc"`
}
