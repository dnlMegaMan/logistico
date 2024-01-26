package models

// EnviarCargosSisaludModalParam is...
type EnviarCargosSisaludModalParam struct {
	Empresa             int    `json:"esacodigo"`
	Division            int    `json:"hdgcodigo"`
	IDMovimiento        int    `json:"idmovimiento"`
	IDDetalleMovimiento int    `json:"idmovdet"`
	IDDevolucion        int    `json:"iddevolucion"`
	Servidor            string `json:"servidor"`
}
