package models

// ArticulosxBodega is...
type ArticulosxBodega struct {
	FBoIDBodega      int     `json:"fboidbodega"`
	CodBodega        int     `json:"codbodega"`
	HDGCodigo        int     `json:"hdgcodigo"`
	ESACodigo        int     `json:"esacodigo"`
	CMECodigo        int     `json:"cmecodigo"`
	MeInIDProd       int     `json:"meinidprod"`
	PuntoAsigna      int     `json:"puntoasigna"`
	PuntoReordena    int     `json:"puntoreordena"`
	StockCritico     int     `json:"stockcritico"`
	StockActual      int     `json:"stockactual"`
	DesBodega        string  `json:"desbodega"`
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
	Campo1           string  `json:"campo1"`
	NivelReposicion  int     `json:"nivelreposicion"`
	ControlMinimo    string  `json:"controlminimo"`
}
