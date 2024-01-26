package models

// PMovimientosFarmacia is...
type PMovimientosFarmacia struct {
	PiHDGCodigo int                       `json:"hdgcodigo"`
	PiESACodigo int                       `json:"esacodigo"`
	PiCMECodigo int                       `json:"cmecodigo"`
	PiServidor  string                    `json:"servidor"`
	PiUsuario   string                    `json:"usuario"`
	PiTipoMov   int                       `json:"tipomov"`
	PiNumMov    int                       `json:"movimfarid"`
	PiCtaID     int                       `json:"ctaid"`
	PiCliID     int                       `json:"cliid"`
	PiEstID     int                       `json:"estid"`
	Detalle     []PDetMovimientosFarmacia `json:"pdetmovimientosfarmacia"`
}
