package models

// ParametrosProv is...
type ParametrosProv struct {
	PIHDGCodigo     int    `json:"hdgcodigo"`
	PIESACodigo     int    `json:"esacodigo"`
	PICMECodigo     int    `json:"cmecodigo"`
	PINumeroRutProv int    `json:"rutprov"`
	PINombreProv    string `json:"nombreprov"`
	PiUsuario       string `json:"usuario"`
	PiServidor      string `json:"servidor"`
}

// ParametrosMeinProv
type ParametrosMeinProv struct {
	HDGCodigo int    `json:"hdgcodigo"`
	CMECodigo int    `json:"cmecodigo"`
	ESACodigo int    `json:"esacodigo"`
	Proveedor int    `json:"proveedor"`
	Codigo    string `json:"codigo"`
	Servidor  string `json:"servidor"`
}
