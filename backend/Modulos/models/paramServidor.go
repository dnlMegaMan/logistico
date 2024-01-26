package models

// ParamServidor is...
type ParamServidor struct {
	HDGCodigo    int    `json:"hdgcodigo"`
	CMECodigo    int    `json:"cmecodigo"`
	ESACodigo    int    `json:"esacodigo"`
	PiServidorBD string `json:"servidorbd"`
	PiUsuario    string `json:"usuario"`
	PiServidor   string `json:"servidor"`
}
