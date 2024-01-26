package models

// ParamControlStockMin is...
type ParamControlStockMin struct {
	PiServidor         string `json:"servidor"`
	PiUsuario          string `json:"usuario"`
	PiHdgCodigo        int    `json:"hdgcodigo"`
	PiEsaCodigo        int    `json:"esacodigo"`
	PiCmeCodigo        int    `json:"cmecodigo"`
	PiTipoReport       string `json:"tiporeport"`
	FechaInicio        string `json:"fechainicio"`
	FechaTermino       string `json:"fechatermino"`
	IDBodegaSolicita   int    `json:"idbodegasolicita"`
	IDBodegaSuministro int    `json:"idbodegasuministro"`
	IDArticulo         int    `json:"idarticulo"`
}
