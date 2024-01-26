package models

// ParamDatosDetallesOCDevol is...
type ParamDatosDetallesOCDevol struct {
	ProveedorID    int    `json:"proveedorid"`
	GuiaTipoDocto  int    `json:"guiatipodocto"`
	NumeroDocRecep int    `json:"numerodocrecep"`
	PiUsuario      string `json:"usuario"`
	PiServidor     string `json:"servidor"`
}
