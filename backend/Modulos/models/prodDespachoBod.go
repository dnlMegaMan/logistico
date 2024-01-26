package models

// ProdDespachoBod is...
type ProdDespachoBod struct {
	SoliID                 int    `json:"soliid"`
	SodeID                 int    `json:"sodeid"`
	Lote                   string `json:"lote"`
	FechaVto               string `json:"fechavto"`
	CantRecepcionada       int    `json:"cantrecepcionada"`
	CantDespachada         int    `json:"cantdespachada"`
	MeInID                 int    `json:"meinid"`
	CodMei                 string `json:"codmei"`
	MeInDescri             string `json:"meindescri"`
	CantSoli               int    `json:"cantsoli"`
	CantRecepcionado       int    `json:"cantrecepcionado"`
	CantDevolucion         int    `json:"cantdevolucion"`
	CantPendienteRecepcion int    `json:"cantpendienterecepcion"`
}
