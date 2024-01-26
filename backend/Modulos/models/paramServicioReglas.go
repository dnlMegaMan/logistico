package models

// ParamServicioReglas is...
type ParamServicioReglas struct {
	PiServidor        string `json:"servicioid"`
	HdgCodigo         int    `json:"hdgcodigo"`
	EsaCodigo         int    `json:"esacodigo"`
	CmeCodigo         int    `json:"cmecodigo"`
	CodServicioActual string `json:"codservicioactual"`

}
