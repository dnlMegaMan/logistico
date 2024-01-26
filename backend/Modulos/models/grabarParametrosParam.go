package models

type ParametroRequest struct {
	Id          int    `json:"id"`
	Tipo        int    `json:"tipo"`
	Codigo      int    `json:"codigo"`
	Descripcion string `json:"descripcion"`
	Estado      int    `json:"estado"`

	// "I" para insertar, "M" para modificar uno existente
	Accion string `json:"accion"`
}

type GrabarParametrosRequest struct {
	HDGCodigo  int                `json:"hdgcodigo"`
	ESACodigo  int                `json:"esacodigo"`
	CMECodigo  int                `json:"cmecodigo"`
	Usuario    string             `json:"usuario"`
	Servidor   string             `json:"servidor"`
	Parametros []ParametroRequest `json:"parametros"`
}

type GrabarParametrosResponse struct {
	Mensaje Mensaje `json:"mensaje"`
}
