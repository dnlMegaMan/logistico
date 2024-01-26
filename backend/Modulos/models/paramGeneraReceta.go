package models

// ParamGeneraRecetaCab is...
type ParamGeneraRecetaCab struct {
	Servidor       string                 `json:"servidor"`
	ReceID         int                    `json:"receid"`
	HdgCodigo      int                    `json:"hdgcodigo"`
	EsaCodigo      int                    `json:"esacodigo"`
	CmeCodigo      int                    `json:"cmecodigo"`
	Ambito         int                    `json:"ambito"`
	Tipo           string                 `json:"tipo"`
	Numero         int                    `json:"numero"`
	SubReceta      int                    `json:"subreceta"`
	Fecha          string                 `json:"fecha"`
	FechaEntrega   string                 `json:"fechaentrega"`
	FichaPaci      int                    `json:"fichapaci"`
	CtaID          int                    `json:"ctaid"`
	UrgID          int                    `json:"urgid"`
	Dau            int                    `json:"dau"`
	ClID           int                    `json:"clid"`
	TipDocPac      int                    `json:"tipdocpac"`
	DocumPac       string                 `json:"documpac"`
	NombrePaciente string                 `json:"nombrepaciente"`
	TipDocProf     int                    `json:"tipdocprof"`
	DocumProf      string                 `json:"documprof"`
	NombreMedico   string                 `json:"nombremedico"`
	Especialidad   string                 `json:"especialidad"`
	RolProf        string                 `json:"rolprof"`
	CodUnidad      string                 `json:"codunidad"`
	GlosaUnidad    string                 `json:"glosaunidad"`
	CodServicio    string                 `json:"codservicio"`
	GlosaServicio  string                 `json:"glosaservicio"`
	CodCama        string                 `json:"codcama"`
	CamGlosa       string                 `json:"camglosa"`
	CodPieza       string                 `json:"codpieza"`
	PzaGloza       string                 `json:"pzagloza"`
	TipoPrevision  int                    `json:"tipoprevision"`
	GlosaPrevision string                 `json:"glosaprevision"`
	PrevisionPac   int                    `json:"previsionpac"`
	GlosaPrevPac   string                 `json:"glosaprevpac"`
	EstadoReceta   string                 `json:"estadoreceta"`
	Observacion    string                 `json:"receobservacion"`
	CobroIncluido  int                    `json:"codcobroincluido"`
	CodBodega      int                    `json:"codbodega"`
	Detalle        []ParamGeneraRecetaDet `json:"recetadetalle"`
}

// ParamGeneraRecetaCab is...
type ParamGeneraRecetaDet struct {
	RedeID         int    `json:"redeid"`
	CodigoProd     string `json:"codigoprod"`
	DescriProd     string `json:"descriprod"`
	Dosis          int    `json:"dosis"`
	Veces          int    `json:"veces"`
	Tiempo         int    `json:"tiempo"`
	GlosaPoso      string `json:"glosaposo"`
	CantidadSolici int    `json:"cantidadsolici"`
	CantidadADespa int    `json:"cantidadadespa"`
	EstadoProd     string `json:"estadoprod"`
	Accion         string `json:"acciond"`
}
