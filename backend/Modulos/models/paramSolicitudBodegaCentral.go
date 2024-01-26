package models

// ParamSolicitudBodegaCentral is...
type ParamSolicitudBodegaCentral struct {
	HDGCodigo 	   int    `json:"hdgcodigo"`
	ESACodigo 	   int    `json:"esacodigo"`
	CMECodigo	   int    `json:"cmecodigo"`
	Usuario   	   string `json:"usuario"`
	Servidor  	   string `json:"servidor"`
	FechaInicio    string    `json:"fechainicio"`
	FechaFin       string    `json:"fechafin"`
}