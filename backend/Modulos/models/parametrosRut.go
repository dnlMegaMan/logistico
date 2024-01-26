package models

// ParametrosRut is...
type ParametrosRut struct {
	PIHDGCodigo     int    `json:"hdgcodigo"`
	PICMECodigo     int    `json:"cmecodigo"`
	PIESACodigo     int    `json:"esacodigo"`
	PINumeroRutProv int    `json:"numerorutprov"`
	PiUsuario       string `json:"usuario"`
	PiServidor      string `json:"servidor"`
}
