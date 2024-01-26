package models

// ModSolicitud is...
type ModSolicitud struct {
	SERVIDOR	string `json:"servidor"`
	SoliID    	int    `json:"soliid"`
	SoliEstado	int    `json:"soliestado"`
	ReceID		int    `json:"receid"`
	ReceEstado	string `json:"receestado"`
	Bandera     int    `json:"bandera"`
}
