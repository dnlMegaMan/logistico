package models

// Detallelote is...
type Detallelote struct{
	Sodeid            int 		`json:"sodeid"`
	Soliid            int 		`json:"soliid"`
	Fechavto          string	`json:"fechavto"`
	Lote              string 	`json:"lote"`
	Boddestino        int 		`json:"boddestino"`
	Bodorigen         int 		`json:"bodorigen"`
	Cantidad          int 		`json:"cantidad"`
	Cantidaddev       int 		`json:"cantidaddev"`
	Codmei            string 	`json:"codmei"`
	Descripcion       string 	`json:"descripcion"`
	Meinid            int 		`json:"meinid"`
	Meintiporeg       string 	`json:"meintiporeg"`
	Tipobodorigen     string 	`json:"tipobodorigen"`
	Tipoboddestino    string 	`json:"tipoboddestino"`
	Glscombo          string 	`json:"glscombo"`
}