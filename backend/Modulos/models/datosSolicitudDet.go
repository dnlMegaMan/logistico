package models

// DatosSolicitudDet is...
type DatosSolicitudDet struct {
	SoliID             int    `json:"soliid"`
	SodeID             int    `json:"sodeid"`
	SodeArticulo       string `json:"articulo"`
	SodeArticuloDes    string `json:"articulodes"`
	SodeDosis          int    `json:"dosis"`
	SodeFormulacion    int    `json:"formulacion"`
	SodeDias           int    `json:"dias"`
	SodeUniDespcod     int    `json:"unidespachocod"`
	SodeUniDespDes     string `json:"unidespachodes"`
	SodeCantSoli       int    `json:"cantsoli"`
	SodeViaAdminstra   string `json:"viaadministracion"`
	PiCantdispensar    int    `json:"cantdispensar"`
	SodeCantDispensada int    `json:"cantdispensada"`
	PiCantPendiente    int    `json:"canpendiente"`
	SodeObservacion    string `json:"observacion"`
	BoInStockActual    int    `json:"stockactual"`
	MeInValCosto       int    `json:"valcosto"`
	MeInValVenta       int    `json:"valVenta"`
	SodeUniCompcod     int    `json:"unicompracod"`
	SoliCtaCteID       int    `json:"ctacteid"`
	MeInIncobFon       string `json:"incobrableFonasa"`
	MeinArticuloID     int    `json:"articuloid"`
	SodeCantDevo       int    `json:"sodecantdevo"`
	RecepCanDevo       int    `json:"recepcandevo"`
	RecepFecDevo       string `json:"recepfecdevo"`
	RecepResDevo       string `json:"recepResdevo"`
	Campo              string `json:"campo"`
}
