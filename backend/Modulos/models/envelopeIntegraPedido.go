package models

import "encoding/xml"

// EnvelopeIntegraPedido is...
type EnvelopeIntegraPedido struct {
	XMLName xml.Name          `xml:"http://schemas.xmlsoap.org/soap/envelope/ Envelope"`
	GetBody BodyIntegraPedido `xml:"Body"`
}

// BodyIntegraPedido is...
type BodyIntegraPedido struct {
	XMLName            xml.Name        `xml:"Body"`
	GetwmIntegraPedido wmIntegraPedido `xml:"http://tempuri.org/WsLogIntegraPedido/wsLogIntegraPedido wmIntegraPedido"`
}

// wmIntegraPedido is...
type wmIntegraPedido struct {
	XMLName                   xml.Name               `xml:"http://tempuri.org/WsLogIntegraPedido/wsLogIntegraPedido wmIntegraPedido"`
	GetOperacionIntegraPedido OperacionIntegraPedido `xml:"Operacion"`
}

// OperacionIntegraPedido is...
type OperacionIntegraPedido struct {
	XMLName             xml.Name      `xml:"Operacion"`
	Empresa             int           `xml:"Empresa"`
	Division            int           `xml:"Division"`
	Unidad              int           `xml:"Unidad"`
	TipoPedido          string        `xml:"TipoPedido"`
	TipoOperacion       int           `xml:"TipoOperacion"`
	BodegaCod           int           `xml:"BodegaCod"`
	FechaProceso        string        `xml:"FechaProceso"`
	PedidoParcialidad   int           `xml:"PedidoParcialidad"`
	CConsumoCod         int           `xml:"CConsumoCod"`
	PedidoTipoRecepcion int           `xml:"PedidoTipoRecepcion"` //short
	BodegaDestinoCod    int           `xml:"BodegaDestinoCod"`
	GlosaCab            string        `xml:"GlosaCab"`
	UsuarioProceso      string        `xml:"UsuarioProceso"`
	GetDetallePedido    DetallePedido `xml:"DetallePedido"`
}

// DetallePedido is...
type DetallePedido struct {
	XMLName         xml.Name      `xml:"DetallePedido"`
	GetLineaDetalle []LineaPedido `xml:"LineaPedido"`
}

// LineaPedido is...
type LineaPedido struct {
	XMLName        xml.Name `xml:"LineaPedido"`
	ProductoCod    string   `xml:"ProductoCod"`
	ServicioCod    string   `xml:"ServicioCod"`
	Cantidad       int      `xml:"Cantidad"` //decimal
	FechaRequerida string   `xml:"FechaRequerida"`
	CreCodigo      int      `xml:"CreCodigo"`
	CdiCodigo      int      `xml:"CdiCodigo"`
	TprID          int      `xml:"TprId"`
	PryNumero      string   `xml:"PryNumero"`
	GlosaDet       string   `xml:"GlosaDet"`
	Proveedor      string   `xml:"Proveedor"`
	PrecioUnitario int      `xml:"PrecioUnitario"` //decimal
	Moneda         int      `xml:"Moneda"`
}
