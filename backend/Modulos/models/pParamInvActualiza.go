package models

import "errors"

// PParamInvActualiza is...
type PParamInvActualiza struct {
	Detalle []ParamInvActualiza `json:"paraminvactualiza"`
}

type ParamInvActualizar struct {
	HDGCodigo int    `json:"hdgcodigo"`
	ESACodigo int    `json:"esacodigo"`
	CMECodigo int    `json:"cmecodigo"`
	IDInv     int    `json:"idinventario"`
	IDAjust   int    `json:"ajusteinvent"`
	UsuarioId int    `json:"usuarioid"`
	Usuario   string `json:"usuario"`
	Servidor  string `json:"servidor"`
}

func (param *ParamInvActualizar) Validate() error {
	if param.Servidor == "" {
		return errors.New("error: Servidor es obligatorio")
	}
	if param.HDGCodigo == 0 {
		return errors.New("error:HDGCodigo es obligatorio")
	}
	if param.ESACodigo == 0 {
		return errors.New("error:ESACodigo es obligatorio")
	}
	if param.CMECodigo == 0 {
		return errors.New("error:CMECodigo es obligatorio")
	}

	return nil
}

// GetUsuario es un método en tu interfaz Validator para obtener el usuario.
func (param *ParamInvActualizar) GetUsuario() string {
	return param.Usuario
}
