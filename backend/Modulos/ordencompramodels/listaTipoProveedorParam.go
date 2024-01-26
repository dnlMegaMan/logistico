package models

// ListaProveedorEntrada is...
type ListaProveedorEntrada struct {
	Servidor string `json:"servidor"`
}

// ListaProveedorSalida is...
type ListaProveedorSalida struct {
	RutProveedor int    `json:"rutproveedor"`
	DescProveedor string `json:"descproveedor"`
	Mensaje          string `json:"mensaje"`
}
