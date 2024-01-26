package models

// ResConsultaEncSolicitudBod is...
type ResConsultaEncSolicitudBod struct {
	SBODID         int    `json:"sbodid"`
	PiHDGCodigo    int    `json:"hdgcodigo"`
	PiESACodigo    int    `json:"esacodigo"`
	PiCMECodigo    int    `json:"cmecodigo"`
	BodegaOrigen   int    `json:"bodegaorigen"`
	BodegaOriDes   string `json:"bodegaorides"`
	BodegaDestino  int    `json:"bodegadestino"`
	BodegaDestDes  string `json:"bodegadestdes"`
	PrioridadCod   int    `json:"prioridadcod"`
	EstCod         int    `json:"esticod"`
	EstDes         string `json:"estides"`
	UsuarioCrea    string `json:"usuariocrea"`
	FechaCrea      string `json:"fechacrea"`
	UsuarioModif   string `json:"usuariomodif"`
	FechaModif     string `json:"fechamodif"`
	UsuarioElimina string `json:"usuarioelimina"`
	FechaElimina   string `json:"fechaelimina"`
}
