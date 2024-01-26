package models

import "errors"

// ParametrosConsInv is...
type ParametrosConsInv struct {
	HDGCodigo       int    `json:"hdgcodigo"`
	ESACodigo       int    `json:"esacodigo"`
	CMECodigo       int    `json:"cmecodigo"`
	FechaGeneraInv  string `json:"fechagenerainv"`
	BodegaInv       int    `json:"bodegainv"`
	TipoProductoInv string `json:"tipoproductoinv"`
	GrupoInv        int    `json:"grupoinv"`
	PiUsuario       string `json:"usuario"`
	PiServidor      string `json:"servidor"`
	PageNumber      int    `json:"pagenumber"`
	PageSize        int    `json:"pagesize"`
	Grupo           int    `json:"grupo"`
}

func (param *ParametrosConsInv) Validate() error {
	if param.PiServidor == "" {
		return errors.New("error: Servidor es obligatorio")
	}
	if param.HDGCodigo == 0 {
		return errors.New("error:Hdgcodigo es obligatorio")
	}
	if param.ESACodigo == 0 {
		return errors.New("error:Esacodigo es obligatorio")
	}
	if param.CMECodigo == 0 {
		return errors.New("error:Cmecodigo es obligatorio")
	}

	return nil
}

// GetUsuario es un método en tu interfaz Validator para obtener el usuario.
func (param *ParametrosConsInv) GetUsuario() string {
	return param.PiUsuario
}
