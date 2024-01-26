package models

type ConfiguracionLogisticoRequest struct {
	Servidor  string `json:"servidor"`
	HDGCodigo int    `json:"hdgcodigo"`
	ESACodigo int    `json:"esacodigo"`
	CMECodigo int    `json:"cmecodigo"`
	Usuario   string `json:"usuario"`
}

type ConfiguracionLogisticoResponse struct {
	RangoFechasSolicitudes int `json:"rangoFechasSolicitudes"`
	TiempoExpiraSesionMs   int `json:"tiempoExpiraSesionMs"`
}
