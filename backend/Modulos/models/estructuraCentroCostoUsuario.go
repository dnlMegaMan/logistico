package models

// EstructuraCentroCostoUsuario is...
type EstructuraCentroCostoUsuario struct {
	SERVIDOR                    string               `json:"servidor"`
	IDUSUARIO                   int                  `json:"idusuario"`
	IDCENTROCOSTO               int                  `json:"idcentrocosto"`
	HDGCODIGO                   int                  `json:"hdgcodigo"`
	ESACODIGO                   int                  `json:"esacodigo"`
	CMECODIGO                   int                  `json:"cmecodigo"`
	GLOUNIDADESORGANIZACIONALES string               `json:"glounidadesorganizacionales"`
	DETALLE                     []CentroCostoUsuario `json:"detalle"`
	ACCION                      string               `json:"accion"`
}
