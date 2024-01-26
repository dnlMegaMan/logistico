package models

// ParamBuscaStock is...
type ParamBuscaStock struct {
	BodegaOrigen int    `json:"bodegaorigen"`
	MeInID       int    `json:"meinid"`
	PiUsuario    string `json:"usuario"`
	PiServidor   string `json:"servidor"`
}
