package models

// ParametrosNombre is...
type ParametrosNombre struct {
	PIHDGCodigo       int    `json:"hdgcodigo"`
	PIDescripcionProv string `json:"descripcionprov"`
	PiUsuario         string `json:"usuario"`
	PiServidor        string `json:"servidor"`
}
