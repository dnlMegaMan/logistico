package models

// ParamHolding is...
type ParamHolding struct {
	PiHDGCodigo int    `json:"hdgcodigo"`
	PiUsuario   string `json:"usuario"`
	PiServidor  string `json:"servidor"`
}

func (ecb *ParamHolding) Validate() error {

	return nil
}

// GetUsuario es un método en tu interfaz Validator para obtener el usuario.
func (ecb *ParamHolding) GetUsuario() string {
	return ecb.PiUsuario
}
