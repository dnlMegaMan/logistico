package models

// RecetaDetalleModal is...
type RecetaDetalleModal struct {
	FechaDig     string `json:"fechadig"`
	Ambito       string `json:"ambito"`
	Receta       string `json:"receta"`
	ReceNumero   string `json:"recenumero"`
	Tipo         string `json:"tipo"`
	TrPrFEntrega string `json:"trprfentrega"`
	Codigo       string `json:"codigo"`
	Descripcion  string `json:"descripcion"`
	Solicitado   string `json:"solicitado"`
	Despachado   string `json:"despachado"`
	Pendiente    string `json:"pendiente"`
}
