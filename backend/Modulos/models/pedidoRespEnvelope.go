package models

import "encoding/xml"

// PedidoRespEnvelope is...
type PedidoRespEnvelope struct {
	XMLName xml.Name           `xml:"Envelope"`
	Body    PedidoRespBody     `xml:"Body"`
}

// PedidoRespBody is...
type PedidoRespBody struct {
	XMLName     xml.Name           `xml:"Body"`
	GetResponse PedidoRespResponse `xml:"wmIntegraPedidoResponse"`
}

// PedidoRespResponse is...
type PedidoRespResponse struct {
	XMLName   xml.Name         `xml:"wmIntegraPedidoResponse"`
	GetResult PedidoRespResult `xml:"wmIntegraPedidoResult"`
}

// PedidoRespResult is...
type PedidoRespResult struct {
	XMLName xml.Name `xml:"wmIntegraPedidoResult"`
	//Type           string `xml:"type,attr"`
	GetMensajes     PedidoRespMensajes `xml:"Mensajes"`
	Status          int                `xml:"Status"`
	CodError        int                `xml:"CodError"`
	EstadoResultado int                `xml:"EstadoResultado"`
	Mensaje         string             `xml:"Mensaje,omitempty"`
	MsgError        string             `xml:"MsgError,omitempty"`
	NumeroPedido    int                `xml:"NumeroPedido"`
}

// PedidoRespMensajes is...
type PedidoRespMensajes struct {
	XMLName       xml.Name                `xml:"Mensajes"`
	GetMensajeNxt [1]PedidoRespMensajeNxt `xml:"MensajeNxt"`
}

// PedidoRespMensajeNxt is...
type PedidoRespMensajeNxt struct {
	XMLName        xml.Name `xml:"MensajeNxt"`
	Codigo         int      `xml:"Codigo"`
	Message        string   `xml:"Message"`
	ProcesoNegocio string   `xml:"ProcesoNegocio"`
	Severidad      int      `xml:"Severidad"`
}
