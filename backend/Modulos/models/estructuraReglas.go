package models

// EstructuraReglas is...
type EstructuraReglas struct {
	HDGCodigo       int      `json:"hdgcodigo"`
	CMECodigo       int      `json:"cmecodigo"`
	ESACodigo       int      `json:"esacodigo"`
	Reglatipo       string   `json:"reglatipo"`
	Reglatipobodega string   `json:"reglatipobodega"`
	BodegaCodigo    int      `json:"bodegacodigo"`
	CodigoServicio  string   `json:"codigoservicio"`
	IDproducto      int      `json:"idproducto"`
	Servidor        string   `json:"servidor"`
	ReglasAplicar   []Reglas `json:"reglas"`
}
