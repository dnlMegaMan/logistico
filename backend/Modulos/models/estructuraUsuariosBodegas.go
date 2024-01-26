package models

// EstructuraUsuariosBodegas is...
type EstructuraUsuariosBodegas struct {
	Accion         string `json:"accion"`
	FbouID         int    `json:"bouid"`
	FbouFbodCodigo int    `json:"bodegacodigo"`
	FbouUserID     int    `json:"userid"`
	GlsUsuario     string `json:"glosausuario"`
	Servidor       string `json:"servidor"`
	Usuario        string `json:"usuario"`
}
