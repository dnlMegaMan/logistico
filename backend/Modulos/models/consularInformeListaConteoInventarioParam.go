package models

import "errors"

type EstructuraParam struct {
	HDGCodigo int    `json:"hdgcodigo"`
	ESACodigo int    `json:"esacodigo"`
	CMECodigo int    `json:"cmecodigo"`
	Servidor  string `json:"servidor"`
	Usuario   string `json:"usuario"`
}

type ClinfarParamProResponse struct {
	ID          int    `json:"id"`
	Tipo        int    `json:"tipo"`
	Codigo      int    `json:"codigo"`
	Descripcion string `json:"descripcion"`
	Valor       string `json:"valor"`
}

type ClinfarParamBodResponse struct {
	ID          int    `json:"id"`
	Descripcion string `json:"descripcion"`
}

type ConsularInformeListaConteoInventario struct {
	ListaTipoProductos  []ClinfarParamProResponse `json:"listaTipoProductos"`
	ListaGrupoArticulos []ClinfarParamProResponse `json:"listaGrupoArticulos"`
	ListaBodegas        []ClinfarParamBodResponse `json:"listaBodegas"`
	CantidadResistrada  int                       `json:"cantidadRegistrada"`
}

func (ecb *EstructuraParam) Validate() error {
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

// GetUsuario es un método en tu interfaz Validator para obtener el usuario.
func (ecb *EstructuraParam) GetUsuario() string {
	return ecb.Usuario
}
