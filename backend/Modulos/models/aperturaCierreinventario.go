package models

import "errors"

type EstructuraObtenerUltimoPeriodoInvenario struct {
	Servidor  string `json:"servidor"`
	Usuario   string `json:"usuario"`
	Hdgcodigo int    `json:"hdgcodigo"`
	Esacodigo int    `json:"esacodigo"`
	Fecha     string `json:"fecha"`
	Cmecodigo int    `json:"cmecodigo"`
}

func (ecb *EstructuraObtenerUltimoPeriodoInvenario) Validate() error {
	if ecb.Servidor == "" {
		return errors.New("error: Servidor es obligatorio")
	}
	if ecb.Hdgcodigo == 0 {
		return errors.New("error:Hdgcodigo es obligatorio")
	}
	if ecb.Esacodigo == 0 {
		return errors.New("error:Esacodigo es obligatorio")
	}
	if ecb.Cmecodigo == 0 {
		return errors.New("error:Cmecodigo es obligatorio")
	}

	return nil
}

// GetUsuario es un método en tu interfaz Validator para obtener el usuario.
func (ecb *EstructuraObtenerUltimoPeriodoInvenario) GetUsuario() string {
	return ecb.Usuario
}

type RespuestaObtenerUltimoPeriodoInvenario struct {
	Id            int    `json:"id"`
	FechaApertura string `json:"fecha_apertura"`
	FechaCierre   string `json:"fecha_cierre"`
}
