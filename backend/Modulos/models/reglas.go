package models

// Reglas is...
type Reglas struct {
	Reglaid                 int    `json:"reglaid"`
	Reglahdgcodigo          int    `json:"reglahdgcodigo"`
	Reglacmecodigo          int    `json:"reglacmecodigo"`
	Reglatipo               string `json:"reglatipo"`
	Reglatipobodega         string `json:"reglatipobodega"`
	ReglaBodegaCodigo       int    `json:"reglabodegaCodigo"`
	ReglaIDProducto         int    `json:"reglaidproducto"`
	ReglaBodegaMedicamento  int    `json:"reglabodegamedicamento"`
	ReglaBodegaInsumos      int    `json:"reglabodegainsumos"`
	ReglaBedegaControlados  int    `json:"reglabedegacontrolados"`
	ReglaBodegaConsignacion int    `json:"reglabodegaconsignacion"`
	CODIGOSERVICIO          string `json:"codigoservicio"`
}
