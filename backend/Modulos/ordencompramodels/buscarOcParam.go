package models

// BuscarOcEntrada is...
type BuscarOcEntrada struct {
	NumOc     int    `json:"numoc"`
	Servidor  string `json:"servidor"`
	HDGCodigo int    `json:"hdgcodigo"`
	ESACodigo int    `json:"esacodigo"`
	CMECodigo int    `json:"cmecodigo"`
	Usuario   string `json:"usuario"`
}

// BuscarOcFiltroEntrada is...
type BuscarOcFiltroEntrada struct {
	Servidor  string `json:"servidor"`
	HDGCodigo int    `json:"hdgcodigo"`
	ESACodigo int    `json:"esacodigo"`
	CMECodigo int    `json:"cmecodigo"`
	Estado    int    `json:"estado"`
	Desde     string `json:"desde"`
	Hasta     string `json:"hasta"`
	Proveedor int    `json:"proveedor"`
	Pantalla  string `json:"pantalla"`
}

// BuscarOcSalida is...
type BuscarOcSalida struct {
	OrcoId          int    `json:"orcoid"`
	ProveedorRut    string `json:"proveedorrut"`
	DescripcionProv string `json:"descripcionprov"`
	DireccionProv   string `json:"direccionprov"`
	ContactoProv    string `json:"contactoprov"`
	MontoMinFac     int    `json:"montominfac"`
	TipoPago        string `json:"tipopago"`
	Estado          int    `json:"estado"`
	EstadoDesc      string `json:"estadodesc"`
	TipoPagoVal     int    `json:"tipopagoval"`
	FechaEmision    string `json:"fechaemision"`
	ProvId          int    `json:"provid"`
	FechaAnulacion  string `json:"fechaanulacion"`
	UserAnulacion   string `json:"useranulacion"`
	ListaDocumentos string `json:"listadocumentos"`
	OrcoNumDoc      int    `json:"orconumdoc"`
	OrcoBodId       int    `json:"orcobodid"`
	BodegaNombre    string `json:"bodeganombre"`
	Mensaje         string `json:"mensaje"`
}
