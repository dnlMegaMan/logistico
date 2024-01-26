package models

// ParamValorCosto is...
type ParamValorCosto struct {
	HDGCodigo   int    `json:"hdgcodigo"`
	ESACodigo   int    `json:"esacodigo"`
	CMECodigo   int    `json:"cmecodigo"`
	OcDetCodMei string `json:"ocdetcodmei"`
	ProveedorID int    `json:"proveedorid"`
	PiUsuario   string `json:"usuario"`
	PiServidor  string `json:"servidor"`
}
