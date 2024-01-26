package models

// CentroCostoUsuario is...
type CentroCostoUsuario struct {
	SERVIDOR                    string `json:"servidor"`
	IDUSUARIO                   int    `json:"idusuario"`
	IDCENTROCOSTO               int    `json:"idcentrocosto"`
	HDGCODIGO                   int    `json:"hdgcodigo"`
	ESACODIGO                   int    `json:"esacodigo"`
	CMECODIGO                   int    `json:"cmecodigo"`
	GLOUNIDADESORGANIZACIONALES string `json:"glounidadesorganizacionales"`
	ACCION                      string `json:"accion"`
}
