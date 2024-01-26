package models

import "errors"

type EstructuraGenerarInventarioSistemas struct {
	HDGCodigo int    `json:"hdgcodigo"`
	ESACodigo int    `json:"esacodigo"`
	CMECodigo int    `json:"cmecodigo"`
	Servidor  string `json:"servidor"`
	Usuario   string `json:"usuario"`
}

type GenerarInventarioSistemasProResponse struct {
	ID          int    `json:"id"`
	Tipo        int    `json:"tipo"`
	Codigo      int    `json:"codigo"`
	Descripcion string `json:"descripcion"`
	Valor       string `json:"valor"`
}

type GenerarInventarioSistemasBodResponse struct {
	ID          int    `json:"id"`
	Descripcion string `json:"descripcion"`
}

type RespuestaGenerarAjusteInventario struct {
	ListaTipoProductos []GenerarInventarioSistemasProResponse `json:"listaTipoProductos"`
	ListaBodegas       []GenerarInventarioSistemasBodResponse `json:"listaBodegas"`
}

func (egis *EstructuraGenerarInventarioSistemas) Validate() error {
	if egis.Servidor == "" {
		return errors.New("error: Servidor es obligatorio")
	}
	if egis.HDGCodigo == 0 {
		return errors.New("error:HDGCodigo es obligatorio")
	}
	if egis.ESACodigo == 0 {
		return errors.New("error:ESACodigo es obligatorio")
	}
	if egis.CMECodigo == 0 {
		return errors.New("error:CMECodigo es obligatorio")
	}

	return nil
}

// GetUsuario es un método en tu interfaz Validator para obtener el usuario.
func (egis *EstructuraGenerarInventarioSistemas) GetUsuario() string {
	return egis.Usuario
}
