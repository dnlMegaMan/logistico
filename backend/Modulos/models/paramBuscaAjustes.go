package models

// ParamBuscaAjustes is...
type ParamBuscaAjustes struct {
	FechaAjusteIni string `json:"fechaajusteini"`
	FechaAjusteFin string `json:"fechaajustefin"`
	BodegaCodigo   int    `json:"bodegacodigo"`
	Responsable    string `json:"responsable"`
	ProductoTipo   string `json:"productotipo"`
	TipoMotivoAjus int    `json:"tipomotivoajus"`
	PiUsuario      string `json:"usuario"`
	PiServidor     string `json:"servidor"`
}
