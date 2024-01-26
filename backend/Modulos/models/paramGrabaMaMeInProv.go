package models

// ParamGrabaMaMeInProv is...
type ParamGrabaMaMeInProv struct {
	ProveedorID      int     `json:"proveedorid"`
	ProductoID       int     `json:"productoid"`
	ProductoTipo     string  `json:"productotipo"`
	MontoUltCom      float64 `json:"montoultcom"`
	PlazoEntrega     int     `json:"fechaentrega"`
	ProductoVigencia string  `json:"productovigencia"`
	PiUsuario        string  `json:"usuario"`
	PiServidor       string  `json:"servidor"`
}
