package models

// EventoSolicitud is...
type EventoSolicitud struct {
	PoSoliID      int    `json:"solid"`
	PoCodEvento   int    `json:"codevento"`
	PoDesEvento   string `json:"desevento"`
	PoFecha       string `json:"fecha"`
	PoObservacion string `json:"observacion"`
	PoUsuario     string `json:"usuario"`
	PoNombreUsuario     string `json:"nombreusuario"`
}
