package models

// ParaNomCliente is...
type ParaNomCliente struct {
	HDGCodigo      int    `json:"hdgcodigo"`
	NombresCliente string `json:"nombrescliente"`
	PiUsuario      string `json:"usuario"`
	PiServidor     string `json:"servidor"`
}
