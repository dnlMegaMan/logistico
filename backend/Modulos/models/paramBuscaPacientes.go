package models

// ParamBuscaPacientes is...
type ParamBuscaPacientes struct {
	HDGCodigo     int    `json:"hdgcodigo"`
	CMECodigo     int    `json:"cmecodigo"`
	ESACodigo     int    `json:"esacodigo"`
	TipoDocumento int    `json:"tipodocumento"`
	DocumentoID   string `json:"documentoid"`
	Paterno       string `json:"paterno"`
	Materno       string `json:"materno"`
	Nombres       string `json:"nombres"`
	CliID         int    `json:"cliid"`
	Usuario       string `json:"usuario"`
	Servidor      string `json:"servidor"`
}
