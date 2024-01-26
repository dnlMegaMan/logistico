package models

// ProductosProvee is...
type ProductosProvee struct {
	ProveedorID      int     `json:"proveedorid"`
	ProductoID       int     `json:"productoid"`
	ProductoCodigo   string  `json:"productocodigo"`
	ProductoDescri   string  `json:"productodescri"`
	ProductoTipo     string  `json:"productotipo"`
	MontoUltCom      float64 `json:"montoultcom"`
	PlazoEnterga     int     `json:"plazoentrega"`
	ProductoVigencia string  `json:"productovigencia"`
	Campo            string  `json:"campo"`
}
