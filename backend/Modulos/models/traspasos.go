package models

// Traspasos is...
type Traspasos struct {
	IDTraspaso      int    `json:"idtraspaso"`
	ServicioOrigen  int    `json:"servicioorigen"`
	AbrevSrvOrigen  string `json:"abrevsrvorigen"`
	DescSrvOrigen   string `json:"descsrvorigen"`
	ServicioDestino int    `json:"serviciodestino"`
	AbrevSrvDestino string `json:"abrevsvrdestino"`
	DescSrvDestino  string `json:"descsrvdestino"`
	FechaTraspaso   string `json:"fechatraspaso"`
	ResponTraspaso  string `json:"respontraspaso"`
	ObservTraspaso  string `json:"observtraspaso"`
}
