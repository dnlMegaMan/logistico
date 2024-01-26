package models

import "errors"

// ParamInfListaConteoInventario is...
type ParamInfListaConteoInventario struct {
	PiServidor   string `json:"servidor"`
	PiUsuario    string `json:"usuario"`
	PiTipoReport string `json:"tiporeport"`
	PiBodCodigo  int    `json:"bodcodigo"`
	PiCodigo     int    `json:"codigo"`
	PiTipoReg    string `json:"tiporeg"`
	PiGrupo      int    `json:"grupo"`
	PiHdgCodigo  int    `json:"hdgcodigo"`
	PiEsaCodigo  int    `json:"esacodigo"`
	PiCmeCodigo  int    `json:"cmecodigo"`
	PiIDReport   int64  `json:"idreport"`
	PiLanguage   string `json:"language"`
}

func (pilc *ParamInfListaConteoInventario) Validate() error {
	if pilc.PiServidor == "" {
		return errors.New("error: Servidor es obligatorio")
	}
	if pilc.PiHdgCodigo == 0 {
		return errors.New("error:HDGCodigo es obligatorio")
	}
	if pilc.PiEsaCodigo == 0 {
		return errors.New("error:ESACodigo es obligatorio")
	}
	if pilc.PiCmeCodigo == 0 {
		return errors.New("error:CMECodigo es obligatorio")
	}

	return nil
}

// GetUsuario es un método en tu interfaz Validator para obtener el usuario.
func (pilc *ParamInfListaConteoInventario) GetUsuario() string {
	return pilc.PiUsuario
}
