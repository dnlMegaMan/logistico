package models

import "errors"

// EstructuraConsultaBodega is...
type EstructuraConsultaBodega struct {
	HDGCodigo        int    `json:"hdgcodigo"`
	ESACodigo        int    `json:"esacodigo"`
	CMECodigo        int    `json:"cmecodigo"`
	CodBodega        int    `json:"codbodega"`
	FboCodigoBodega  string `json:"fbocodigobodega"`
	DesBodega        string `json:"desbodega"`
	FbodEstado       string `json:"estado"`
	FbodTipoPorducto string `json:"tipoproducto"`
	FbodTipoBodega   string `json:"tipobodega"`
	Servidor         string `json:"servidor"`
	Usuario          string `json:"usuario"`
	Codmei           string `json:"codmei"`
}

func (ecb *EstructuraConsultaBodega) Validate() error {
	if ecb.Servidor == "" {
		return errors.New("error: Servidor es obligatorio")
	}
	if ecb.HDGCodigo == 0 {
		return errors.New("error:HDGCodigo es obligatorio")
	}
	if ecb.ESACodigo == 0 {
		return errors.New("error:ESACodigo es obligatorio")
	}
	if ecb.CMECodigo == 0 {
		return errors.New("error:CMECodigo es obligatorio")
	}

	return nil
}

// GetUsuario es un metodo en tu interfaz Validator para obtener el usuario.
func (ecb *EstructuraConsultaBodega) GetUsuario() string {
	return ecb.Usuario
}
