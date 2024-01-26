package models

type BodegaSuministroBuscaReposicion struct {
	Codigo int    `json:"codigo"`
	Tipo   string `json:"tipo"`
}

// ParamBuscaReposicion is...
type ParamBuscaReposicion struct {
	HDGCodigo         int                             `json:"hdgcodigo"`
	ESACodigo         int                             `json:"esacodigo"`
	CMECodigo         int                             `json:"cmecodigo"`
	BodegaSolicitante int                             `json:"bodegaorigen"`
	BodegaSuministro  BodegaSuministroBuscaReposicion `json:"bodegasuministro"`
	TipoProducto      string                          `json:"tiporegmein"`
	FechaInicio       string                          `json:"fechainicio"`
	FechaTermino      string                          `json:"fechatermino"`
	Usuario           string                          `json:"usuario"`
	Servidor          string                          `json:"servidor"`
	TipoReposicion    int                             `json:"tiporeposicion"`
	CODMEI            string                          `json:"codmei"`
}
