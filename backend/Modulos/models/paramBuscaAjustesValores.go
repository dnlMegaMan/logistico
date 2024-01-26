package models

// ParamBuscaAjustesValores is...
type ParamBuscaAjustesValores struct {
	FechaAjusteIni string `json:"fechaajusteini"`
	FechaAjusteFin string `json:"fechaajustefin"`
	Responsable    string `json:"responsable"`
	ProductoTipo   string `json:"productotipo"`
	TipoMotivoAjus int    `json:"tipomotivoajus"`
	PiUsuario      string `json:"usuario"`
	PiServidor     string `json:"servidor"`
}
