package models
// Sucursal is...
type Sucursal struct {
	PiHDGCodigo int    `json:"hdgcodigo"`
	PiESACodigo int    `json:"esacodigo"`
	PiCMECodigo int    `json:"cmecodigo"`
	PiCMENombre string `json:"cmenombre"`
}
