package models

import "encoding/xml"

// WmConsultaSaldoEnvelope is...
type WmConsultaSaldoEnvelope struct {
	XMLName xml.Name            `xml:"http://schemas.xmlsoap.org/soap/envelope/ Envelope"`
	Body    WmConsultaSaldoBody `xml:"Body"`
}

// WmConsultaSaldoBody is...
type WmConsultaSaldoBody struct {
	XMLName         xml.Name           `xml:"Body"`
	GetResponseBody WmConsultaSaldoXML `xml:"http://tempuri.org/WsLogIntegraConsulta/WsLogIntegraConsulta wmConsultaSaldo"`
}

// WmConsultaSaldoXML is...
type WmConsultaSaldoXML struct {
	XMLName     xml.Name `xml:"http://tempuri.org/WsLogIntegraConsulta/WsLogIntegraConsulta wmConsultaSaldo"`
	GetResponse Entrada  `xml:"entrada"`
}

// Entrada is...
type Entrada struct {
	XMLName        xml.Name `xml:"entrada"`
	Empresa        string   `xml:"Empresa"`
	Division       string   `xml:"Division"`
	Bodega         string   `xml:"Bodega"`
	Producto       string   `xml:"Producto"`
	IndicadorSaldo string   `xml:"IndicadorSaldo"`
}
