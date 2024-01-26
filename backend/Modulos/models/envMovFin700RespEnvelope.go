package models

import "encoding/xml"

// MyRespEnvelope is...
type MyRespEnvelope struct {
	XMLName xml.Name
	Body    Body
}

// Body is...
type Body struct {
	XMLName     xml.Name                   `xml:"Body"`
	GetResponse wmIntegraOperacionResponse `xml:"wmIntegraOperacionResponse"`
}

// wmIntegraOperacionResponse is...
type wmIntegraOperacionResponse struct {
	XMLName   xml.Name                 `xml:"wmIntegraOperacionResponse"`
	GetResult wmIntegraOperacionResult `xml:"wmIntegraOperacionResult"`
}

// wmIntegraOperacionResult is...
type wmIntegraOperacionResult struct {
	XMLName xml.Name `xml:"wmIntegraOperacionResult"`
	//Type             string   `xml:"type,attr"`
	Mensajes           Mensajes           `xml:"Mensajes"`
	Status             string             `xml:"Status"`
	CodError           string             `xml:"CodError"`
	EstadoResultado    string             `xml:"EstadoResultado"`
	Folio              string             `xml:"Folio"`
	DetalleCodigoError DetalleCodigoError `xml:"DetalleCodigoError"`
}

// Mensajes is...
type Mensajes struct {
	XMLName xml.Name `xml:"Mensajes"`
	//Type       string       `xml:"type,attr"`
	MensajeNxt []MensajeNxt `xml:"MensajeNxt"`
}

// MensajeNxt is...
type MensajeNxt struct {
	XMLName        xml.Name `xml:"MensajeNxt"`
	Codigo         string   `xml:"Codigo"`
	Message        string   `xml:"Message"`
	ProcesoNegocio string   `xml:"ProcesoNegocio"`
	Severidad      string   `xml:"Severidad"`
}

// DetalleCodigoError is...
type DetalleCodigoError struct {
	XMLName       xml.Name        `xml:"DetalleCodigoError"`
	DetalleCodigo []DetalleCodigo `xml:"DetalleCodigoError"`
}

// DetalleCodigo is...
type DetalleCodigo struct {
	XMLName     xml.Name `xml:"DetalleCodigoError"`
	Linea       string   `xml:"Linea"`
	ProductoCod string   `xml:"ProductoCod"`
	Observacion string   `xml:"Observacion"`
}
