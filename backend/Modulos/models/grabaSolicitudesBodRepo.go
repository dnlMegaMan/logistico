package models

// GrabaSolicitudesBodRepo is...
type GrabaSolicitudesBodRepo struct {
	SBODID          int                         `json:"sbodid"`
	PiHDGCodigo     int                         `json:"hdgcodigo"`
	PiESACodigo     int                         `json:"esacodigo"`
	PiCMECodigo     int                         `json:"cmecodigo"`
	BodegaOrigen    int                         `json:"bodegaorigen"`
	BodegaDestino   int                         `json:"bodegadestino"`
	PrioridadCod    int                         `json:"prioridadcod"`
	EstCod          int                         `json:"esticod"`
	UsuarioCrea     string                      `json:"usuariocrea"`
	FechaCrea       string                      `json:"fechacrea"`
	UsuarioModif    string                      `json:"usuariomodif"`
	FechaModif      string                      `json:"fechamodif"`
	UsuarioElimina  string                      `json:"usuarioelimina"`
	FechaElimina    string                      `json:"fechaelimina"`
	PiServidor      string                      `json:"servidor"`
	FechaReposicion string                      `json:"fechareposicion"`
	Detalle         []DetalleSolicitudesBodRepo `json:"detallesolicitudesbodrepo"`
}

// DetalleSolicitudesBodRepo is...
type DetalleSolicitudesBodRepo struct {
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
	Marca          string `json:"marca"`
}
