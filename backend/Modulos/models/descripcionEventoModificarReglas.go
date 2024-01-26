package models

type CambioModificarReglas struct {
	/*
	  Estos son los posibles valores para los lugares por el momento
	   	- "Bodega Insumos"
	   	- "Bodega Medicamentos"
	   	- "Bodega Consignación"
	   	- "Bodega Controlados"
	   	- "Bodega Servicio"
	   	- "Centro Costo"
	   	- "Centro Consumo "
	*/
	Lugar string `json:"lugar"`

	// "0" cuando no existe un antes, por ejemplo, al crear
	Antes   int `json:"antes"`
	Despues int `json:"despues"`
}

type DescripcionEventoModificarReglas struct {
	CodigoServicio string                  `json:"codigoServicio"`
	Cambios        []CambioModificarReglas `json:"cambios"`
}
