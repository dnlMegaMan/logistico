package models

// ParaBuscarxCodDesc is...
type ParaBuscarxCodDesc struct {
	CodigoMein      string `json:"codigomein"`
	DescripcionMeIn string `json:"descripcionmein"`
	TipoRegMeIn     string `json:"tiporegmein"`
	BodegaCodigo    int    `json:"bodegacodigo"`
	BodegaDestino   int    `json:"bodegadestino"`
	PiUsuario       string `json:"usuario"`
	PiServidor      string `json:"servidor"`
}
