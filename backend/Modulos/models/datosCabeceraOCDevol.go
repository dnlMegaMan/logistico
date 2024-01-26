package models

// DatosCabeceraOCDevol is...
type DatosCabeceraOCDevol struct {
	NumeroDocRecep    int    `json:"numerodocrecep"`
	GuiaFechaEmision  string `json:"guiafechaemision"`
	NomProveedor      string `json:"nomproveedor"`
	GuiaMontoTotal    int    `json:"guiamontototal"`
	GuiaID            int    `json:"guiaid"`
	NumeroRutProv     int    `json:"numerorutprov"`
	DvRutProv         string `json:"dvrutprov"`
	ProveedorID       int    `json:"proveedorid"`
	GuiaTipoDocto     int    `json:"guiatipodocto"`
	GuiaTipoDoctoDesc string `json:"guiatipodoctodesc"`
	DireccionProv     string `json:"direccionprov"`
	Giro              string `json:"giro"`
	CiudadCodigo      int    `json:"ciudadcodigo"`
	CiudadDes         string `json:"ciudaddescripcion"`
	ComunaCodigo      int    `json:"comunacodigo"`
	ComunaDes         string `json:"comunadesdescripcion"`
	Telefono          int    `json:"telefono"`
	Telefono2         int    `json:"telefono2"`
	Diremail          string `json:"diremail"`
}
