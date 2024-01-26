package models

// Plantillas is...
type Plantillas struct {
	PlanID          int             `json:"planid"`
	PlanDescrip     string          `json:"plandescrip"`
	HDGCodigo       int             `json:"hdgcodigo"`
	ESACodigo       int             `json:"esacodigo"`
	CMECodigo       int             `json:"cmecodigo"`
	BodOrigen       int             `json:"bodorigen"`
	BodDestino      int             `json:"boddestino"`
	PlanVigente     string          `json:"planvigente"`
	FechaCreacion   string          `json:"fechacreacion"`
	UsuarioCreacion string          `json:"usuariocreacion"`
	FechaModifica   string          `json:"fechamodifica"`
	UsuarioModifica string          `json:"usuariomodifica"`
	FechaElimina    string          `json:"fechaelimina"`
	UsuarioElimina  string          `json:"usuarioelimina"`
	Servidor        string          `json:"servidor"`
	Accion          string          `json:"accion"`
	BodOrigenDesc   string          `json:"bodorigendesc"`
	BodDestinoDesc  string          `json:"boddestinodesc"`
	PlanVigenteDesc string          `json:"planvigentedesc"`
	SerCodigo       string          `json:"serviciocod"`
	SerDescripcion  string          `json:"serviciodesc"`
	PlanTipo        int             `json:"plantipo"`
	TipoPedido      int             `json:"tipopedido"`
	Detalle         []PlantillasDet `json:"plantillasdet"`
}

// PlantillasDet is...
type PlantillasDet struct {
	PldeID          int     `json:"pldeid"`
	PlanID          int     `json:"planid"`
	CodMei          string  `json:"codmei"`
	MeInID          int     `json:"meinid"`
	MeInDescri      string  `json:"meindescri"`
	CantSoli        int     `json:"cantsoli"`
	PldeVigente     string  `json:"pldevigente"`
	FechaCreacion   string  `json:"fechacreacion"`
	UsuarioCreacion string  `json:"usuariocreacion"`
	FechaModifica   string  `json:"fechamodifica"`
	UsuarioModifica string  `json:"usuariomodifica"`
	FechaElimina    string  `json:"fechaelimina"`
	UsuarioElimina  string  `json:"usuarioelimina"`
	AccionD         string  `json:"acciond"`
	TipoRegMeIn     string  `json:"tiporegmein"`
	Mensajes        Mensaje `json:"mensaje"`
	StockDestino    int     `json:"stockdestino"`
}
