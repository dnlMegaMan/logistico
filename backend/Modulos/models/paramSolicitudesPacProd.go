package models

import "errors"

// ParamSolicitudesPacProd is...
type ParamSolicitudesPacProd struct {
	PiHDGCodigo int    `json:"hdgcodigo"`
	PiESACodigo int    `json:"esacodigo"`
	PiCMECodigo int    `json:"cmecodigo"`
	PiServidor  string `json:"servidor"`
	PiUsuario   string `json:"usuario"`
	PiCliID     int    `json:"cliid"`
	PiCtaID     int    `json:"ctaid"`
	PiEstID     int    `json:"estid"`
	PiBodCodigo int    `json:"bodcodigo"`
	PiCodMei    string `json:"codmei"`
	PiSoliID    int    `json:"soliid"`
	PiLote      string `json:"lote"`
	PiFechaVto  string `json:"fechavto"`
}

func (ecb *ParamSolicitudesPacProd) Validate() error {
	if ecb.PiServidor == "" {
		return errors.New("error: Servidor es obligatorio")
	}
	if ecb.PiHDGCodigo == 0 {
		return errors.New("error:HDGCodigo es obligatorio")
	}
	if ecb.PiESACodigo == 0 {
		return errors.New("error:ESACodigo es obligatorio")
	}
	if ecb.PiCMECodigo == 0 {
		return errors.New("error:CMECodigo es obligatorio")
	}

	return nil
}

// GetUsuario es un metodo en tu interfaz Validator para obtener el usuario.
func (ecb *ParamSolicitudesPacProd) GetUsuario() string {
	return ecb.PiUsuario
}
