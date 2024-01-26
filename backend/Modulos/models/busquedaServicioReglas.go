package models

// BusquedaServicioReglas is...
type BusquedaServicioReglas struct {
	Id                 int    `json:"id"`
	HdgCodigo          int    `json:"hdgcodigo"`
	EsaCodigo          int    `json:"esacodigo"`
	CmeCodigo          int    `json:"cmecodigo"`
	Codigo             string `json:"codservicio"`
	Descripcion        string `json:"descservicio"`
	Bodegacontrolados  int    `json:"bodcontrolados"`
	Bodegaconsignacion int    `json:"bodconsignacion"`
	Bodegainsumos      int    `json:"bodinsumos"`
	Bodegamedicamento  int    `json:"bodmedicamento"`
	Bodegacodigo       int    `json:"bodgeneral"`
	Id_producto        string `json:"idproducto"`
}
