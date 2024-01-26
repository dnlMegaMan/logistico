package models

// SolicitudesPacProd is...
type SolicitudesPacProd struct {
	SoliID            int    `json:"soliid"`
	FechaCreacionSol  string `json:"fechacreacionsol"`
	FechaDispensacion string `json:"fechadispensacion"`
	Lote              string `json:"lote"`
	FechaVto          string `json:"fechavto"`
	IDMovimientoDet   int    `json:"idmovimientodet"`
	CantDispensada    int    `json:"cantdispensada"`
	CantDevuelta      int    `json:"cantdevuelta"`
	SodeID            int    `json:"sodeid"`
	CantSoli          int    `json:"cantsoli"`
	CodMei            string `json:"codmei"`
	MeInDescri        string `json:"meindescri"`
	DescBodegaOrigen  string `json:"descbodegaorigen"`
	DescBodegaDestino string `json:"descbodegadestino"`
	DescServicio      string `json:"descservicio"`
	CantADevolver     int    `json:"cantadevolver"`
	CantRechazo       int    `json:"cantrechazo"`
	Estado            int    `json:"estado"`
	Bandera           int    `json:"bandera"`
}
