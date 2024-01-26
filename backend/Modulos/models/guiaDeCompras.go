package models

// GuiaDeCompras is...
type GuiaDeCompras struct {
	RutProveedor       string `json:"rutproveedor"`
	NomProveedor       string `json:"nomproveedor"`
	GuiaMontoTotal     int    `json:"guiamontototal"`
	GuiaCantidadItem   int    `json:"guiacantidaditem"`
	GuiaFechaEmision   string `json:"guiafechaemision"`
	GuiaFechaRecepcion string `json:"guiafecharecepcion"`
	GuiaTipoDocto      string `json:"guiatipodocto"`
}
