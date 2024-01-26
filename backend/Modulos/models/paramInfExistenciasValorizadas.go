package models

import "errors"

// ParamInfExistenciasValorizadas is...
type ParamInfExistenciasValorizadas struct {
	HdgCodigo  int    `json:"hdgcodigo"`
	EsaCodigo  int    `json:"esacodigo"`
	CmeCodigo  int    `json:"cmecodigo"`
	Bodega     int    `json:"codigobod"`
	TipoReport string `json:"tiporeport"`
	Fecha      string `json:"fecha"`
	TipoReg    string `json:"tiporeg"`
	ReporteID  int64  `json:"reporteid"`
	Language   string `json:"language"`
	Servidor   string `json:"servidor"`
	Usuario    string `json:"usuario"`
}

func (piev *ParamInfExistenciasValorizadas) Validate() error {
	if piev.Servidor == "" {
		return errors.New("error: Servidor es obligatorio")
	}
	if piev.HdgCodigo == 0 {
		return errors.New("error:HDGCodigo es obligatorio")
	}
	if piev.EsaCodigo == 0 {
		return errors.New("error:ESACodigo es obligatorio")
	}
	if piev.CmeCodigo == 0 {
		return errors.New("error:CMECodigo es obligatorio")
	}

	return nil
}

// GetUsuario es un método en tu interfaz Validator para obtener el usuario.
func (piev *ParamInfExistenciasValorizadas) GetUsuario() string {
	return piev.Usuario
}
