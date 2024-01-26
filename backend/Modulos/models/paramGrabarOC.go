package models

// ParamGrabarOC is...
type ParamGrabarOC struct {
	HDGCodigo        int    `json:"hdgcodigo"`
	ESACodigo        int    `json:"esacodigo"`
	CMECodigo        int    `json:"cmecodigo"`
	ProveedorID      int    `json:"proveedorid"`
	Usuario          string `json:"usuario"`
	NumeroDeItems    int    `json:"numerodeitems"`
	EstadoOC         int    `json:"estadooc"`
	FechaAnulacionOC string `json:"fechaanulacionoc"`
	BodegaID         int    `json:"bodegaid"`
	PiUsuario        string `json:"piusuario"`
	PiServidor       string `json:"servidor"`
}
