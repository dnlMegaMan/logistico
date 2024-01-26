package models

// GrabaEncSolicitudBod is...
type GrabaEncSolicitudBod struct {
	SBODID          int    `json:"sbodid"`
	PiHDGCodigo     int    `json:"hdgcodigo"`
	PiESACodigo     int    `json:"esacodigo"`
	PiCMECodigo     int    `json:"cmecodigo"`
	BodegaOrigen    int    `json:"bodegaorigen"`
	BodegaDestino   int    `json:"bodegadestino"`
	PrioridadCod    int    `json:"prioridadcod"`
	EstCod          int    `json:"esticod"`
	UsuarioCrea     string `json:"usuariocrea"`
	FechaCrea       string `json:"fechacrea"`
	UsuarioModif    string `json:"usuariomodif"`
	FechaModif      string `json:"fechamodif"`
	UsuarioElimina  string `json:"usuarioelimina"`
	FechaElimina    string `json:"fechaelimina"`
	PiServidor      string `json:"servidor"`
	FechaReposicion string `json:"fechareposicion"`
}
