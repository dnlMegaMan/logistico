package models

// BuscarNotaFiltroEntrada is...
type BuscarNotaFiltroEntrada struct {
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

type BuscarNotaSalida struct {
	Nota            int                     `json:"nota"`
	OdmdFecha       string                  `json:"odmdfecha"`
	OdmdResponsable string                  `json:"odmdresponsable"`
	OdmdTipoDoc     int                     `json:"odmdtipodoc"`
	ProvId          int                     `json:"provid"`
	GuiaId          int                     `json:"guiaid"`
	OdmdCantidad    int                     `json:"odmdcantidad"`
	GuiaDetalle     BuscarGuiaSalida        `json:"guiadetalle"`
	NotaDetalle     []DetalleMovimientoDevo `json:"notadetalle"`
	Mensaje         string                  `json:"mensaje"`
}

// // BuscarNotaSalida is...
// type BuscarNotaGuiaSalida struct {
// 	GuiaId          int                     `json:"guiaid"`
// 	MontoTotal      string                  `json:"montototal"`
// 	FechaEmision    string                  `json:"fechaemision"`
// 	ProvDescripcion string                  `json:"provdescripcion"`
// 	ProvGiro        string                  `json:"provgiro"`
// 	ProvDireccion   string                  `json:"provdireccion"`
// 	ProvComuna      string                  `json:"provcomuna"`
// 	ProvCiudad      string                  `json:"provciudad"`
// 	ProvTelefono    int                     `json:"provtelefono"`
// 	ProvTelefono2   int                     `json:"provtelefono2"`
// 	ProvNumfax      int                     `json:"provnumfax"`
// 	Numdoc          int                     `json:"numdoc"`
// 	Tipodoc         string                  `json:"tipodoc"`
// 	Tipo            int                     `json:"tipo"`
// 	RutProv         string                  `json:"rutprov"`
// 	Mensaje         string                  `json:"mensaje"`
// 	OdmdCantidad    int                     `json:"odmdcantidad"`
// 	DetalleMov      []DetalleMovimientoDevo `json:"detallemov"`
// }
