package models

import "errors"

// ParamReporteConteoManualInventario is...
type ParamReporteConteoManualInventario struct {
	Servidor     string `json:"servidor"`
	Usuario      string `json:"usuario"`
	TipoReport   string `json:"tiporeport"`
	ReporteID    int64  `json:"reporteid"`
	Bodega       int    `json:"bodegainv"`
	Fechagenera  string `json:"fechagenerainv"`
	TipoProducto string `json:"tipoproductoinv"`
	Grupo        int    `json:"grupo"`
	HdgCodigo    int    `json:"hdgcodigo"`
	EsaCodigo    int    `json:"esacodigo"`
	CmeCodigo    int    `json:"cmecodigo"`
	Language     string `json:"language"`
}

func (prcmi *ParamReporteConteoManualInventario) Validate() error {
	if prcmi.Servidor == "" {
		return errors.New("error: Servidor es obligatorio")
	}
	if prcmi.HdgCodigo == 0 {
		return errors.New("error:HDGCodigo es obligatorio")
	}
	if prcmi.EsaCodigo == 0 {
		return errors.New("error:ESACodigo es obligatorio")
	}
	if prcmi.CmeCodigo == 0 {
		return errors.New("error:CMECodigo es obligatorio")
	}

	return nil
}

// GetUsuario es un método en tu interfaz Validator para obtener el usuario.
func (prcmi *ParamReporteConteoManualInventario) GetUsuario() string {
	return prcmi.Usuario
}
