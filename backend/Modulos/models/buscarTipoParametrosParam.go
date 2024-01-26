package models

type BuscarTipoParametrosRequest struct {
	HDGCodigo int    `json:"hdgcodigo"`
	ESACodigo int    `json:"esacodigo"`
	CMECodigo int    `json:"cmecodigo"`
	Usuario   string `json:"usuario"`
	Servidor  string `json:"servidor"`
}

type BuscarTipoParametrosResponse struct {
	Id          int    `json:"id"`
	Tipo        int    `json:"tipo"`
	Codigo      int    `json:"codigo"`
	Descripcion string `json:"descripcion"`
	Estado      int    `json:"estado"`
	Username    string `json:"username"`
	Modificable string `json:"modificable"`
}
