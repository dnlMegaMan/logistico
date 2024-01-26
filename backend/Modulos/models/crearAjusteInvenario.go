package models

import "errors"

type EstructuraCrearAjusteInvenario struct {
	HDGodigo  int                `json:"hdgcodigo"`
	ESACodigo int                `json:"esacodigo"`
	CMECodigo int                `json:"cmecodigo"`
	BodegaInv int                `json:"bodegainv"`
	Ajustes   []AjusteInventario `json:"ajustes"`
	Usuario   string             `json:"usuario"`
	Servidor  string             `json:"servidor"`
}

type AjusteInventario struct {
	Iddetalleinven   int    `json:"iddetalleinven"`
	IdInventario     int    `json:"idinventario"`
	MeinId           int    `json:"meinid"`
	CodigoMein       string `json:"codigomein"`
	Stockinvent      int    `json:"stockinvent"`
	AjusteInvent     int    `json:"ajusteinvent"`
	Tipomotivoajus   int    `json:"tipomotivoajus"`
	ValorCosto       int    `json:"valorcosto"`
	Lote             string `json:"lote"`
	FechaVencimiento string `json:"fechavencimiento"`
	CodigoCusm       string `json:"codigocusm"`
}

func (eca *EstructuraCrearAjusteInvenario) Validate() error {
	if eca.Servidor == "" {
		return errors.New("error: Servidor es obligatorio")
	}
	if eca.HDGodigo == 0 {
		return errors.New("error:HDGCodigo es obligatorio")
	}
	if eca.ESACodigo == 0 {
		return errors.New("error:ESACodigo es obligatorio")
	}
	if eca.CMECodigo == 0 {
		return errors.New("error:CMECodigo es obligatorio")
	}

	return nil
}

// GetUsuario es un metodo en tu interfaz Validator para obtener el usuario.
func (eca *EstructuraCrearAjusteInvenario) GetUsuario() string {
	return eca.Usuario
}
