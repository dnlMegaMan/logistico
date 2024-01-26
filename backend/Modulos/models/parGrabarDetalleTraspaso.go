package models

// ParGrabarDetalleTraspaso is...
type ParGrabarDetalleTraspaso struct {
	IDDetTraspaso   int    `json:"iddettraspaso"`
	IDTraspaso      int    `json:"idtraspaso"`
	MeInCodMeI      string `json:"meincodmei"`
	MeInID          int    `json:"meinid"`
	CantidadSolic   int    `json:"cantidadsolic"`
	ResponTraspaso  string `json:"respontraspaso"`
	TipoTransaccion string `json:"tipotransaccion"`
	BodegaDestino   int    `json:"bodegadestino"`
	BodegaOrigen    int    `json:"bodegaorigen"`
	PiUsuario       string `json:"usuario"`
	PiServidor      string `json:"servidor"`
}
