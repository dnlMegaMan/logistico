package models

// EstructuraRelacionBodega is...
type EstructuraRelacionBodega struct {
	HDGCODIGO          int    `json:"hdgcodigo"`
	ESACODIGO          int    `json:"esacodigo"`
	CMECODIGO          int    `json:"cmecodigo"`
	FBODCODIGOSOLICITA int    `json:"codbodegaorigen"`
	FBODCODIGOENTREGA  int    `json:"codbodegarelacion"`
	MEINTIPOREG        int    `json:"tiporelacion"`
	NOMBODEGA          string `json:"nombodega"`
	TIPORELACION       string `json:"glosatiporelacion"`
	Servidor           string `json:"servidor"`
	Usuario            string `json:"usuario"`
	Accion             string `json:"accion"`
}
