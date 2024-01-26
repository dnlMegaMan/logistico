package models

// ProductosEnBodega is...
type ProductosEnBodega struct {
	BodegaCodigo int    `json:"bodegacodigo"`
	IDMeIn       int    `json:"idmein"`
	ProductoCodi string `json:"productocodi"`
	ProductoDesc string `json:"productodesc"`
	ProductoTipo string `json:"productotipo"`
	BodegaStock  int    `json:"bodegastock"`
}
