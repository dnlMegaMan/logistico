package models

import "errors"

// ParamConnect is...
type ParamConnect struct {
	PiUsuario  string `json:"usuario"`
	PiServidor string `json:"servidor"`
	IDUsuario  int    `json:"idusuario"`
	HdgCodigo  int    `json:"hdgcodigo"`
	EsaCodigo  int    `json:"esacodigo"`
	CmeCodigo  int    `json:"cmecodigo"`
	ORIGEN     int    `json:"origen"`
	Idioma     string `json:"idioma"`
	IsMedico   bool   `json:"medico"`
}

func (ecb *ParamConnect) Validate() error {
	if ecb.PiServidor == "" {
		return errors.New("error: Servidor es obligatorio")
	}
	if ecb.HdgCodigo == 0 {
		return errors.New("error:HDGCodigo es obligatorio")
	}
	if ecb.EsaCodigo == 0 {
		return errors.New("error:ESACodigo es obligatorio")
	}
	if ecb.CmeCodigo == 0 {
		return errors.New("error:CMECodigo es obligatorio")
	}

	return nil
}

// GetUsuario es un metodo en tu interfaz Validator para obtener el usuario.
func (ecb *ParamConnect) GetUsuario() string {
	return ecb.PiUsuario
}
