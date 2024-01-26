package models

// CabeceraDeTraspaso is...
type CabeceraDeTraspaso struct {
	IDTraspaso      int    `json:"idtraspaso"`
	ServicioOrigen  int    `json:"servicioorigen"`
	ServicioDestino int    `json:"serviciodestino"`
	FechaTraspaso   string `json:"fechatraspaso"`
	ResponTraspaso  string `json:"respontraspaso"`
	ObservTraspaso  string `json:"observtraspaso"`
	BodegaOrigen    int    `json:"bodegaorigen"`
	BodegaDestino   int    `json:"bodegadestino"`
}
