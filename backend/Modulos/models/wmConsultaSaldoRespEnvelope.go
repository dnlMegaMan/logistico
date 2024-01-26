package models

import "encoding/xml"

// WmConsultaSaldoRespEnvelope is...
type WmConsultaSaldoRespEnvelope struct {
	XMLName xml.Name
	Body    WmConsultaSaldoRspBody
}

// WmConsultaSaldoRspBody is...
type WmConsultaSaldoRspBody struct {
	XMLName     xml.Name                `xml:"Body"`
	GetResponse WmConsultaSaldoResponse `xml:"wmConsultaSaldoResponse"`
}

// WmConsultaSaldoResponse is...
type WmConsultaSaldoResponse struct {
	XMLName   xml.Name              `xml:"wmConsultaSaldoResponse"`
	GetResult WmConsultaSaldoResult `xml:"wmConsultaSaldoResult"`
}

// WmConsultaSaldoResult is...
type WmConsultaSaldoResult struct {
	XMLName xml.Name `xml:"wmConsultaSaldoResult"`
	//Type            string   `xml:"type,attr"`
	Mensajes         string        `xml:"Mensajes"`
	Status           string        `xml:"Status"`
	CodError         string        `xml:"CodError"`
	MsgError         string        `xml:"MsgError"`
	EstadoResultado  string        `xml:"EstadoResultado"`
	Mensaje          string        `xml:"Mensaje"`
	GetDetalleSalida DetalleSalida `xml:"DetalleSalida"`
}

// DetalleSalida is...
type DetalleSalida struct {
	XMLName   xml.Name `xml:"DetalleSalida"`
	GetSalida Salida   `xml:"Salida"`
}

// Salida is...
type Salida struct {
	XMLName    xml.Name `xml:"Salida"`
	Empresa    string   `xml:"Empresa"`
	Division   string   `xml:"Division"`
	Bodega     string   `xml:"Bodega"`
	Producto   string   `xml:"Producto"`
	Cantidad   string   `xml:"Cantidad"`
	Valor      string   `xml:"Valor"`
	CostoMedio string   `xml:"CostoMedio"`
}
