package models

// ParamBuscaPacienteAmbito is...
type ParamBuscaPacienteAmbito struct {
	HDGCodigo           int    `json:"hdgcodigo"`
	CMECodigo           int    `json:"cmecodigo"`
	ESACodigo           int    `json:"esacodigo"`
	CodTipoID           int    `json:"codtipoid"`
	RutPac              string `json:"rutpac"`
	Paterno             string `json:"paterno"`
	Materno             string `json:"materno"`
	Nombres             string `json:"nombres"`
	UnidadID            int    `json:"unidadid"`
	PiezaID             int    `json:"piezaid"`
	Camaid              int    `json:"camid"`
	Servidor            string `json:"servidor"`
	Ambito              int    `json:"ambito"`
	ServicioCod         string `json:"serviciocod"`
	SoloCuentasAbiertas bool   `json:"soloCuentasAbiertas"`
}
