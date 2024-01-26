package models

// RespuestaGrabacionDespachar is...
type RespuestaGrabacionDespachar struct {
	Respuesta string             `json:"respuesta"`
	Detalle   []ProdDespacharBod `json:"proddespacharbod"`
}

// ProdDespacharBod is...
type ProdDespacharBod struct {
	SoliID int `json:"soliid"`
	SodeID int `json:"sodeid"`
	MfDeID int `json:"mfdeid"`
}
