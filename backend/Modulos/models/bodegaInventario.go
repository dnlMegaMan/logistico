package models

import "errors"

// BodegaInventario is...
type EstructuraBodegaInventario struct {
	HDGCodigo int    `json:"hdgcodigo"`
	ESACodigo int    `json:"esacodigo"`
	CMECodigo int    `json:"cmecodigo"`
	BodegaInv int    `json:"bodegainv"`
	Usuario   string `json:"usuario"`
	Servidor  string `json:"servidor"`
}

func (ebi *EstructuraBodegaInventario) Validate() error {
	if ebi.Servidor == "" {
		return errors.New("error: Servidor es obligatorio")
	}
	if ebi.HDGCodigo == 0 {
		return errors.New("error:HDGCodigo es obligatorio")
	}
	if ebi.ESACodigo == 0 {
		return errors.New("error:ESACodigo es obligatorio")
	}
	if ebi.CMECodigo == 0 {
		return errors.New("error:CMECodigo es obligatorio")
	}

	return nil
}

// GetUsuario es un método en tu interfaz Validator para obtener el usuario.
func (ebi *EstructuraBodegaInventario) GetUsuario() string {
	return ebi.Usuario
}
