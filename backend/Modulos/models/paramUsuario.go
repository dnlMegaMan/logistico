package models

import "errors"

// ParamUsuario is...
type ParamUsuario struct {
	PiUsuario  string `json:"usuario"`
	PiClave    string `json:"clave"`
	PiServidor string `json:"servidor"`
}

func (ecb *ParamUsuario) Validate() error {
	if ecb.PiServidor == "" {
		return errors.New("error: Servidor es obligatorio")
	}
	if ecb.PiClave == "" {
		return errors.New("error:HDGCodigo es obligatorio")
	}
	if ecb.PiUsuario == "" {
		return errors.New("error:ESACodigo es obligatorio")
	}
	return nil
}

// GetUsuario es un metodo en tu interfaz Validator para obtener el usuario.
func (ecb *ParamUsuario) GetUsuario() string {
	return ecb.PiUsuario
}
