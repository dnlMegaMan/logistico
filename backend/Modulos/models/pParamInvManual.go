package models

// PParamInvManual is...
type PParamInvManual struct {
	PiServidor string           `json:"servidor"`
	Detalle    []ParamInvManual `json:"paraminvmanual"`
}
