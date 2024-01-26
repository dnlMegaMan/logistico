package models

/**** BuscarGuiaEntrada is...
type BuscarGuiaEntrada struct {
	NumOc     int    `json:"numoc"`
	Servidor  string `json:"servidor"`
	HDGCodigo int    `json:"hdgcodigo"`
	ESACodigo int    `json:"esacodigo"`
	CMECodigo int    `json:"cmecodigo"`
	Usuario   string `json:"usuario"`
}****/

// BuscarGuiaFiltroEntrada is...
type BuscarGuiaFiltroEntrada struct {
	HDGCODIGO int    `json:"hdgcodigo"`
	ESACODIGO int    `json:"esacodigo"`
	CMECODIGO int    `json:"cmecodigo"`
	Servidor  string `json:"servidor"`
	Rut       int    `json:"rut"`
	TipoDoc   int    `json:"tipodoc"`
	NumDoc    int    `json:"numdoc"`
	Desde     string `json:"desde"`
	Hasta     string `json:"hasta"`
	ProvId    int    `json:"provid"`
	MeinId    int    `json:"meinid"`
}

// BuscarGuiaSalida is...
type BuscarGuiaSalida struct {
	GuiaId          int                 `json:"guiaid"`
	MontoTotal      string              `json:"montototal"`
	FechaEmision    string              `json:"fechaemision"`
	ProvDescripcion string              `json:"provdescripcion"`
	ProvGiro        string              `json:"provgiro"`
	ProvDireccion   string              `json:"provdireccion"`
	ProvComuna      string              `json:"provcomuna"`
	ProvCiudad      string              `json:"provciudad"`
	ProvTelefono    int                 `json:"provtelefono"`
	ProvTelefono2   int                 `json:"provtelefono2"`
	ProvNumfax      int                 `json:"provnumfax"`
	Numdoc          int                 `json:"numdoc"`
	Tipodoc         string              `json:"tipodoc"`
	Tipo            int                 `json:"tipo"`
	RutProv         string              `json:"rutprov"`
	Mensaje         string              `json:"mensaje"`
	OdmoCantidad    int                 `json:"odmocantidad"`
	DetalleMov      []DetalleMovimiento `json:"detallemov"`
}

type DetalleMovimiento struct {
	Odmoid           int    `json:"odmoid"`
	MeinCodmei       string `json:"meincodmei"`
	MeinDescri       string `json:"meindescri"`
	Valor            int    `json:"valor"`
	Odmocantidad     int    `json:"odmocantidad"`
	Odmocantdevuelta int    `json:"odmocantdevuelta"`
	Adevolver        int    `json:"adevolver"`
	Lote             string `json:"lote"`
}

type DetalleMovimientoDevo struct {
	MeinCodmei    string `json:"meincodmei"`
	MeinDescri    string `json:"meindescri"`
	OdmdCantidad  int    `json:"odmdcantidad"`
	OdmoCantidad  int    `json:"odmocantidad"`
	Lote          string `json:"lote"`
	TipoDoc       int    `json:"tipodoc"`
	MotivoDevDesc string `json:"motivodevdesc"`
}
