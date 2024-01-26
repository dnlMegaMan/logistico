package models

// ParamGrabarTraspaso is...
type ParamGrabarTraspaso struct {
	IDTraspaso      int    `json:"idtraspaso"`
	ServicioOrigen  int    `json:"servicioorigen"`
	ServicioDestino int    `json:"serviciodestino"`
	FpreExterno     int    `json:"fpreexterno"`
	FechaTraspaso   string `json:"fechatraspaso"`
	ResponTraspaso  string `json:"respontraspaso"`
	ObservTraspaso  string `json:"observtraspaso"`
	TipoMovimiento  string `json:"tipomovimiento"`
	BodegaOrigen    int    `json:"bodegaorigen"`
	BodegaDestino   int    `json:"bodegadestino"`
	PiUsuario       string `json:"usuario"`
	PiServidor      string `json:"servidor"`
}
