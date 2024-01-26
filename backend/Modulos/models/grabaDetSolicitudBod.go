package models

// GrabaDetSolicitudBod is...
type GrabaDetSolicitudBod struct {
	SBDEID         int    `json:"sbdeid"`
	SBODID         int    `json:"sbodid"`
	RepoID         int    `json:"repoid"`
	CodProducto    string `json:"codproducto"`
	MeInID         int    `json:"meinid"`
	CantidadSoli   int    `json:"cantidadsoli"`
	CantidadDesp   int    `json:"cantidaddesp"`
	EstCod         int    `json:"esticod"`
	UsuarioModif   string `json:"usuariomodif"`
	FechaModif     string `json:"fechamodif"`
	UsuarioElimina string `json:"usuarioelimina"`
	FechaElimina   string `json:"fechaelimina"`
	PiServidor     string `json:"servidor"`
	Marca          string `json:"marca"`
}
