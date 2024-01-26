package models

type RequestNuevoMotivoAjusteInvenario struct {
	PiUsuario   string `json:"usuario"`
	PiServidor  string `json:"servidor"`
	Descripcion string `json:"descripcion"`
	IDUsuario   int    `json:"idusuario"`
	HdgCodigo   int    `json:"hdgcodigo"`
	EsaCodigo   int    `json:"esacodigo"`
	CmeCodigo   int    `json:"cmecodigo"`
}
