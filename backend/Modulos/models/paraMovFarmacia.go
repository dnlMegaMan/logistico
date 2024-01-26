package models

// ParaMovFarmacia is...
type ParaMovFarmacia struct {
	PHDGCodigo    int    `json:"hdgcodigo"`
	PESACodigo    int    `json:"esacodigo"`
	PCMECodigo    int    `json:"cmecodigo"`
	FechaMvoDesde string `json:"fechamovdesde"`
	FechaMvoHasta string `json:"fechamovhasta"`
	TipoMov       int    `json:"tipomov"`
	MovimFarID    int    `json:"movimfarid"`
	MovimFecha    string `json:"movimfecha"`
	PiUsuario     string `json:"usuario"`
	PiServidor    string `json:"servidor"`
	Picliid       int    `json:"cliid"`
}
