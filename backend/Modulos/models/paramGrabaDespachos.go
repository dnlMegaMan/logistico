package models

// ParamGrabaDespachos is...
type ParamGrabaDespachos struct {
	HDGCodigo      int    `json:"hdgcodigo"`
	ESACodigo      int    `json:"esacodigo"`
	CMECodigo      int    `json:"cmecodigo"`
	SBDEID         int    `json:"sbdeid"`
	SBODID         int    `json:"sbodid"`
	CodProducto    string `json:"codproducto"`
	MeInID         int    `json:"meinid"`
	CantidadSoli   int    `json:"cantidadsoli"`
	CantidadDesp   int    `json:"cantidaddesp"`
	EstCod         int    `json:"esticod"`
	UsuarioModif   string `json:"usuariomodif"`
	FechaModif     string `json:"fechamodif"`
	FechaSolicitud string `json:"fechasolicitud"`
	PiServidor     string `json:"servidor"`
}
