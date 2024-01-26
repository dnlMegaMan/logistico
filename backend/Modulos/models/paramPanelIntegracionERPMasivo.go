package models

// ParamPanelIntegracionERPMasivo is...
type ParamPanelIntegracionERPMasivo struct {
	Filtro FiltroERP `json:"filtro"`
}

// FiltroERP is...
type FiltroERP struct {
	Servidor            string `json:"servidor"`
	TipoReport          string `json:"tiporeport"`
	Hdgcodigo           int    `json:"hdgcodigo"`
	Esacodigo           int    `json:"esacodigo"`
	Cmecodigo           int    `json:"cmecodigo"`
	Usuario             string `json:"usuario"`
	FechaDesde          string `json:"fechadesde"`
	FechaHasta          string `json:"fechahasta"`
	MovID               int    `json:"movid"`
	SoliID              int    `json:"soliid"`
	Fechasol            string `json:"fechasol"`
	CodBodegaSolicita   int    `json:"codbodegasolicita"`
	CodBodegaSuministro int    `json:"codbodegasuministro"`
	CodEstado           int    `json:"codestado"`
	Referencia          int    `json:"referencia"`
	ReceID              int    `json:"receid"`
	CtaNumCuenta        int    `json:"ctanumcuenta"`
	NumIdentificacion   string `json:"numidentificacion"`
	NombrePAC           string `json:"nombrepac"`
	CodServicio         string `json:"codservicio"`
	CodCentroCosto      int    `json:"codcentrocosto"`
	Descripcion         string `json:"descripcion"`
	Observacion         string `json:"observacion"`
	Opcion              string `json:"opcion"`
}
