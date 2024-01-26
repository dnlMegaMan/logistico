package models

// ParamEliminaMaMeInProv is...
type ParamEliminaMaMeInProv struct {
	ProveedorID int    `json:"proveedorid"`
	ProductoID  int    `json:"productoid"`
	PiUsuario   string `json:"usuario"`
	PiServidor  string `json:"servidor"`
}
