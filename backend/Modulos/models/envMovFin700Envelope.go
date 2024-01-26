package models

import "encoding/xml"

// EnvelopeLlamado is...
type EnvelopeLlamado struct {
	XMLName xml.Name    `xml:"http://schemas.xmlsoap.org/soap/envelope/ Envelope"` //xmlns="http://www.w3.org/2003/05/soap-envelope
	Body    BodyLlamado `xml:"Body"`
}

// BodyLlamado is...
type BodyLlamado struct {
	XMLName         xml.Name           `xml:"Body"`
	GetResponseBody wmIntegraOperacion `xml:"http://tempuri.org/wsLogIntegraOperacion/wsLogIntegraOperacion wmIntegraOperacion"`
}

// wmIntegraOperacion is...
type wmIntegraOperacion struct {
	XMLName     xml.Name  `xml:"http://tempuri.org/wsLogIntegraOperacion/wsLogIntegraOperacion wmIntegraOperacion"`
	GetResponse Operacion `xml:"Operacion"`
}

// Operacion is...
type Operacion struct {
	XMLName             xml.Name         `xml:"Operacion"`
	Empresa             string           `xml:"Empresa"`
	Division            string           `xml:"Division"`
	Unidad              string           `xml:"Unidad"`
	FechaProceso        string           `xml:"FechaProceso"`
	BodegaOrigen        string           `xml:"BodegaOrigen"`
	BodegaDestino       string           `xml:"BodegaDestino"`
	TipoProceso         string           `xml:"TipoProceso"`
	TipoTransaccion     string           `xml:"TipoTransaccion"`
	RecepcionAutomatica string           `xml:"RecepcionAutomatica"`
	OperacionConsumoRef string           `xml:"OperacionConsumoRef"`
	TipoOperacion       string           `xml:"TipoOperacion"`
	UsuarioProceso      string           `xml:"UsuarioProceso"`
	GlosaOperacion      string           `xml:"GlosaOperacion"`
	CentroConsumo       string           `xml:"CentroConsumo"`
	Rut                 string           `xml:"Rut"`
	TipoDocumento       string           `xml:"TipoDocumento"`
	FolioDocumento      string           `xml:"FolioDocumento"`
	FechaDocumento      string           `xml:"FechaDocumento"`
	NroRefExterno       string           `xml:"NroRefExterno"`
	GetDetalleOperacion DetalleOperacion `xml:"DetalleOperacion"`
}

// DetalleOperacion is...
type DetalleOperacion struct {
	XMLName         xml.Name       `xml:"DetalleOperacion"`
	GetLineaDetalle []LineaDetalle `xml:"LineaDetalle"`
}

// LineaDetalle is...
type LineaDetalle struct {
	XMLName          xml.Name      `xml:"LineaDetalle"`
	Linea            string        `xml:"Linea"`
	ProductoCod      string        `xml:"ProductoCod"`
	CantidadStock    string        `xml:"CantidadStock"`
	Cantidad2        string        `xml:"Cantidad2"`
	ValorTotal       string        `xml:"ValorTotal"`
	CentroCosto      string        `xml:"CentroCosto"`
	ConceptoImp      string        `xml:"ConceptoImp"`
	TipoProyecto     string        `xml:"TipoProyecto"`
	NumeroProyecto   string        `xml:"NumeroProyecto"`
	GetDetalleFisico DetalleFisico `xml:"DetalleFisico"`
}

// DetalleFisico is...
type DetalleFisico struct {
	XMLName        xml.Name      `xml:"DetalleFisico"`
	GetLineafisico []LineaFisico `xml:"LineaFisico"`
}

// LineaFisico is...
type LineaFisico struct {
	XMLName           xml.Name `xml:"LineaFisico"`
	Linea             string   `xml:"Linea"`
	CantidadStock     string   `xml:"CantidadStock"`
	Cantidad2         string   `xml:"Cantidad2"`
	Ubicacion         string   `xml:"Ubicacion"`
	NumeroLote        string   `xml:"NumeroLote"`
	LoteFecExpiracion string   `xml:"LoteFecExpiracion"`
	NumeroSerie       string   `xml:"NumeroSerie"`
	Rotulo            string   `xml:"Rotulo"`
	Rotulo2           string   `xml:"Rotulo2"`
}
