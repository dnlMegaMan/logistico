package models

// ParaRutCliente is...
type ParaRutCliente struct {
	HDGCodigo  int    `json:"hdgcodigo"`
	RutCliente string `json:"rutcliente"`
	PiUsuario  string `json:"usuario"`
	PiServidor string `json:"servidor"`
}
