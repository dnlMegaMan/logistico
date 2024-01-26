package models

import "encoding/xml"

// DispensacionRecetaEnvelope is...
type DispensacionRecetaEnvelope struct {
	XMLName                   xml.Name               `xml:"http://schemas.xmlsoap.org/soap/envelope/ Envelope"`
	GetDispensacionRecetaBody DispensacionRecetaBody `xml:"Body"`
}

// DispensacionRecetaBody is...
type DispensacionRecetaBody struct {
	XMLName               xml.Name           `xml:"Body"`
	GetDispensacionReceta DispensacionReceta `xml:"dispensacionRecetaMethod"`
}

// DispensacionReceta is...
type DispensacionReceta struct {
	XMLName         xml.Name      `xml:"http://webservice.fusat.com/ dispensacionRecetaMethod"`
	Empresa         int           `xml:"http://cambio/ Empresa"`
	Sucursal        int           `xml:"http://cambio/ Sucursal"`
	Ambito          int           `xml:"http://cambio/ Ambito"`
	EstadoReceta    string        `xml:"http://cambio/ EstadoReceta"`
	TipoReceta      string        `xml:"http://cambio/ TipoReceta"`
	Receta          int           `xml:"http://cambio/ Receta"`
	Subreceta       int           `xml:"http://cambio/ Subreceta"`
	FechaReceta     string        `xml:"http://cambio/ FechaReceta"`
	FechaEntrega    string        `xml:"http://cambio/ FechaEntrega"`
	CuentaCorriente int           `xml:"http://cambio/ CuentaCorriente"`
	CuentaUrgencia  int           `xml:"http://cambio/ CuentaUrgencia"`
	DAU             int           `xml:"http://cambio/ DAU"`
	IDPaciente      int           `xml:"http://cambio/ IDPaciente"`
	TipoDoctoPac    int           `xml:"http://cambio/ TipoDoctoPac"`
	NumDoctoPac     string        `xml:"http://cambio/ NumDoctoPac"`
	NombrePac       string        `xml:"http://cambio/ NombrePac"`
	TipoDoctoProf   int           `xml:"http://cambio/ TipoDoctoProf"`
	NumDoctoProf    string        `xml:"http://cambio/ NumDoctoProf"`
	NombreProf      string        `xml:"http://cambio/ NombreProf"`
	NroSolicitud    int           `xml:"http://cambio/ NroSolicitud"`
	ComprobanteCaja int           `xml:"http://cambio/ ComprobanteCaja"`
	GetLstDetalle   [1]LstDetalle `xml:"LstDetalle"`
}

// LstDetalle is...
type LstDetalle struct {
	XMLName        xml.Name `xml:"http://cambio/ LstDetalle"`
	CantidadADes   int      `xml:"cantidadADes"`
	CantidadDesp   int      `xml:"cantidadDesp"`
	CantidadSol    int      `xml:"cantidadSol"`
	DESCProducto   string   `xml:"DESCProducto"`
	Dosis          int      `xml:"dosis"`
	EstadoProducto string   `xml:"estadoProducto"`
	GlosaAdmin     string   `xml:"glosaAdmin"`
	Producto       string   `xml:"producto"`
	Tiempo         int      `xml:"tiempo"`
	Veces          int      `xml:"veces"`
}
