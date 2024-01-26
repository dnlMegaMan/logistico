package models

// ParametrosTras is...
type ParametrosTras struct {
	FechaTraspaso   string `json:"fechatraspaso"`
	ServicioOrigen  int    `json:"servicioorigen"`
	ServicioDestino int    `json:"serviciodestino"`
	PiUsuario       string `json:"usuario"`
	PiServidor      string `json:"servidor"`
}
