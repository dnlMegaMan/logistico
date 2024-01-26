package models

// SolicitudesPendienteEntrada is...
type SolicitudesPendienteEntrada struct {
	Servidor  string `json:"servidor"`
	HDGCodigo int    `json:"hdgcodigo"`
	ESACodigo int    `json:"esacodigo"`
	CMECodigo int    `json:"cmecodigo"`
	Usuario   string `json:"usuario"`
}

// SolicitudesPendienteSalida is...
type SolicitudesPendienteSalida struct {
	Mensaje Mensaje `json:"mensaje"`
}
