package models

import "errors"

type EstructuraBloquearbodegas struct {
	Servidor  string        `json:"servidor"`
	Usuario   string        `json:"usuario"`
	Hdgcodigo int           `json:"hdgcodigo"`
	Esacodigo int           `json:"esacodigo"`
	Cmecodigo int           `json:"cmecodigo"`
	Bloqueos  []bloqueosInv `json:"bloqueos"`
}

type bloqueosInv struct {
	Bodega int    `json:"bodega"`
	Accion string `json:"accion"`
	InvpId int    `json:"invpid"`
}

func (ebb *EstructuraBloquearbodegas) Validate() error {
	if ebb.Servidor == "" {
		return errors.New("error: Servidor es obligatorio")
	}
	if ebb.Hdgcodigo == 0 {
		return errors.New("error:Hdgcodigo es obligatorio")
	}
	if ebb.Esacodigo == 0 {
		return errors.New("error:Esacodigo es obligatorio")
	}
	if ebb.Cmecodigo == 0 {
		return errors.New("error:Cmecodigo es obligatorio")
	}

	return nil
}

// GetUsuario es un método en tu interfaz Validator para obtener el usuario.
func (ebb *EstructuraBloquearbodegas) GetUsuario() string {
	return ebb.Usuario
}

type CargarBodegasinventario struct {
	Servidor  string `json:"servidor"`
	Hdgcodigo int    `json:"hdgcodigo"`
	Esacodigo int    `json:"esacodigo"`
	Cmecodigo int    `json:"cmecodigo"`
}

type RespuestaCargarBodegasInventario struct {
	Codigo             int    `json:"codigo"`
	Descripcion        string `json:"descripcion"`
	BloqueoXInventario int    `json:"bloqueo_x_inventario"`
}
