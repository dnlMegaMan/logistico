package models

// Servicios is...
type Servicios struct {
	Servid            int    `json:"servicioid"`
	HdgCodigo         int    `json:"hdgcodigo"`
	EsaCodigo         int    `json:"esacodigo"`
	CmeCodigo         int    `json:"cmecodigo"`
	SerCodigo         string `json:"serviciocod"`
	SerDescripcion    string `json:"serviciodesc"`
	SerCodTipServicio int    `json:"sercodtipservicio"`
}
