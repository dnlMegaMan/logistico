package models

type BuscarParametrosRequest struct {
	HDGCodigo int    `json:"hdgcodigo"`
	ESACodigo int    `json:"esacodigo"`
	CMECodigo int    `json:"cmecodigo"`
	Usuario   string `json:"usuario"`
	Servidor  string `json:"servidor"`
	Tipo      int    `json:"tipo"`
}

type BuscarParametrosResponse struct {
	Id          int    `json:"id"`
	Tipo        int    `json:"tipo"`
	Codigo      int    `json:"codigo"`
	Descripcion string `json:"descripcion"`
	Estado      int    `json:"estado"`
	Username    string `json:"username"`
	Modificable string `json:"modificable"`
}
