package models

// ParamConsultaTraspaso is...
type ParamConsultaTraspaso struct {
	IDTraspaso int    `json:"idtraspaso"`
	PiUsuario  string `json:"usuario"`
	PiServidor string `json:"servidor"`
}
