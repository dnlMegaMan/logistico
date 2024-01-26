package models

// SelCierreKardexProdBod is...
type SelCierreKardexProdBod struct {
	KaDeID          int    `json:"kadeid"`
	CodBodega       int    `json:"codbodega"`
	MeInID          int    `json:"meinid"`
	MeInCodMeI      string `json:"meincodmei"`
	MeInDescri      string `json:"meindescri"`
	MovimFecha      string `json:"movimfecha"`
	MovimDescri     string `json:"movimdescri"`
	TipoMotivoDes   string `json:"tipomotivodes"`
	FBodDescri      string `json:"fbobdescri"`
	NroReceta       int    `json:"nroreceta"`
	RutProf         string `json:"rutprof"`
	NombreProf      string `json:"nombreprof"`
	RutPaciente     string `json:"rutpaciente"`
	NombrePaciente  string `json:"nombrepaciente"`
	CantidadEntrada int    `json:"cantidadentrada"`
	CantidadSalida  int    `json:"cantidadsalida"`
	CantidadSaldo   int    `json:"cantidadsaldo"`
	FBodSuministro  string `json:"fbodsuministro"`
	FBodExternaDesc string `json:"fbodexternadesc"`
	SoliId          int    `json:"soliid"`
	Referencia      int    `json:"referencia"`
	Lote            string `json:"lote"`
	IntErpError     string `json:"errorerp"`
}
