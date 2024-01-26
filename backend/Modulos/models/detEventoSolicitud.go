package models

// DetEventoSolicitud is...
type DetEventoSolicitud struct {
	PoSoliID      int    `json:"solid"`
	PoSodeID      int    `json:"sodeid"`
	PoCodEvento   int    `json:"codevento"`
	PoDesEvento   string `json:"desevento"`
	PoFecha       string `json:"fecha"`
	PoObservacion string `json:"observacion"`
	PoUsuario     string `json:"usuario"`
	PoLote        string `json:"lote"`
	PoFechaVto    string `json:"fechavto"`
	PoCantidad    int    `json:"cantidad"`
	PoNombreUsuario     string `json:"nombreusuario"`
}
