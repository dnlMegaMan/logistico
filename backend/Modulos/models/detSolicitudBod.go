package models

// DetSolicitudBod is...
type DetSolicitudBod struct {
	SBDEID         int    `json:"sbdeid"`
	SBODID         int    `json:"sbodid"`
	CodProducto    string `json:"codproducto"`
	DesProducto    string `json:"desproducto"`
	MeInID         int    `json:"meinid"`
	CantidadSoli   int    `json:"cantidadsoli"`
	CantidadDesp   int    `json:"cantidaddesp"`
	EstCod         int    `json:"esticod"`
	UsuarioModif   string `json:"usuariomodif"`
	FechaModif     string `json:"fechamodif"`
	UsuarioElimina string `json:"usuarioelimina"`
	FechaElimina   string `json:"fechaelimina"`
	StockBodOrigen int    `json:"stockbodorigen"`
	StockBodSolici int    `json:"stockbodsolici"`
}
