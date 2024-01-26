package models

// ArticulosxAsignarBod is...
type ArticulosxAsignarBod struct {
	HDGCodigo        int     `json:"hdgcodigo"`
	ESACodigo        int     `json:"esacodigo"`
	CMECodigo        int     `json:"cmecodigo"`
	MeInIDProd       int     `json:"meinidprod"`
	MeInCodProd      string  `json:"meincodprod"`
	MeInDesProd      string  `json:"meindesprod"`
	MeInTipoProd     string  `json:"meintipoprod"`
	MeInTipoMedi     int     `json:"meintipomedi"`
	MeInValCosto     float64 `json:"meinvalcosto"`
	MeInMargen       int     `json:"meinmargen"`
	MeInValVenta     float64 `json:"meinvalventa"`
	MeInCodUniCompra int     `json:"meincodunicompra"`
	MeInCodUniDespa  int     `json:"meincodunidespa"`
	MeInIncobFonasa  string  `json:"meinincobfonasa"`
	MeInTipoIncob    string  `json:"meintipoincob"`
	MeInEstado       int     `json:"meinestado"`
	MeInDesEstado    string  `json:"meindesestado"`
	Campo            string  `json:"campo"`
}
