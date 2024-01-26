package models

// ResultWmConsultaSaldo is...
type ResultWmConsultaSaldo struct {
	Empresa    string   `xml:"Empresa"`
	Division   string   `xml:"Division"`
	Bodega     string   `xml:"Bodega"`
	Producto   string   `xml:"Producto"`
	Cantidad   string   `xml:"Cantidad"`
	Valor      string   `xml:"Valor"`
	CostoMedio string   `xml:"CostoMedio"`
}
