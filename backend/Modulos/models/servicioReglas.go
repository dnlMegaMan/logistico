package models

// ServicioReglas is...
type ServicioReglas struct {
	Reglaid int `json:"reglaid"`
	Reglahdgcodigo int `json:"reglahdgcodigo"`
	Reglacmecodigo int `json:"reglacmecodigo"`
	Reglatipo string `json:"reglatipo"`
	Reglatipobodega string `json:"reglatipobodega"`
	Reglabodegacodigo int `json:"reglabodegacodigo"`
	Reglaidproducto int `json:"reglaidproducto"`
	Reglabodegamedicamento int `json:"reglabodegamedicamento"`
	Reglabodegainsumos int `json:"reglabodegainsumos"`
	Reglabedegacontrolados int `json:"reglabedegacontrolados"`
	Reglabodegaconsignacion int `json:"reglabodegaconsignacion"`
	Codigoservicio string `json:"codigoservicio"`

}
