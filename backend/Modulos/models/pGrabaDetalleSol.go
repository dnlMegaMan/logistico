package models

// PGrabaDetalleSol is...
type PGrabaDetalleSol struct {
	Detalle []ParamGrabaDetalleSol `json:"paramgrabadetallesol"`
}

// ParamGrabaDetalleSol is...
type ParamGrabaDetalleSol struct {
	SoliID             int    `json:"soliid"`
	SodeID             int    `json:"sodeid"`
	SodeArticulo       string `json:"articulo"`
	SodeArticuloID     int    `json:"articuloid"`
	SodeCantSoli       int    `json:"cantsoli"`
	PiCantdispensar    int    `json:"cantdispensar"`
	SodeCantDispensada int    `json:"cantdispensada"`
	SodeObservacion    string `json:"observacion"`
	Presponsable       string `json:"presponsable"`
	PacienteEstadia    int    `json:"pacienteestadia"`
	SoliCtaCteID       int    `json:"ctacteid"`
	ClienteID          int    `json:"clienteid"`
	MeInValCosto       int    `json:"valcosto"`
	MeInValVenta       int    `json:"valVenta"`
	SodeUniDespcod     int    `json:"unidespachocod"`
	SodeUniCompcod     int    `json:"unicompracod"`
	MeInIncobFon       string `json:"incobrableFonasa"`
	PacienteRut        string `json:"pacienterut"`
	SodeCantDevu       int    `json:"cantdevu"`
	PiServidor         string `json:"servidor"`
	HDGCodigo          int    `json:"hdgcodigo"`
	ESACodigo          int    `json:"esacodigo"`
	CMECodigo          int    `json:"cmecodigo"`
	BodOrigen          int    `json:"bodorigen"`
	BodDestino         int    `json:"boddestino"`
}
