package models

// Despachos is...
type Despachos struct {
	Detalle      []ParamDespachos `json:"paramdespachos"`
}

// ParamDespachos is...
type ParamDespachos struct {
	SoliID                     int     `json:"soliid"`
	HDGCodigo                  int     `json:"hdgcodigo"`
	ESACodigo                  int     `json:"esacodigo"`
	CMECodigo                  int     `json:"cmecodigo"`
	SodeID                     int     `json:"sodeid"`
	CodMei                     string  `json:"codmei"`
	MeInID                     int     `json:"meinid"`
	CantSoli                   int     `json:"cantsoli"`
	CantADespachar             int     `json:"cantadespachar"`
	CantDespachada             int     `json:"cantdespachada"`
	Observaciones              string  `json:"observaciones"`
	UsuarioDespacha            string  `json:"usuariodespacha"`
	EstID                      int     `json:"estid"`
	CtaID                      int     `json:"ctaid"`
	CliID                      int     `json:"cliid"`
	ValCosto                   float64 `json:"valcosto"`
	ValVenta                   int     `json:"valventa"`
	UniDespachocod             int     `json:"unidespachocod"`
	UniCompracod               int     `json:"unicompracod"`
	IncobFon                   string  `json:"incobfon"`
	NumDocPac                  string  `json:"numdocpac"`
	CantDevo                   int     `json:"cantdevo"`
	TipoMovim                  string  `json:"tipomovim"`
	Servidor                   string  `json:"servidor"`
	Lote                       string  `json:"lote"`
	FechaVto                   string  `json:"fechavto"`
	BodOrigen                  int     `json:"bodorigen"`
	BodDestino                 int     `json:"boddestino"`
	CantRecepcionado           int     `json:"cantrecepcionado"`
	CantidadArecepcionar       int     `json:"cantidadarecepcionar"`
	CantidadAdevolver          int     `json:"cantidadadevolver"`
	CodServicioOri             int     `json:"codservicioori"`
	CodServicioActual          string  `json:"codservicioactual"`
	RECENUMERO                 int     `json:"recenumero"`
	RECETIPO                   string  `json:"recetipo"`
	RECEID                     int     `json:"receid"`
	Consumo                    string  `json:"consumo"`
	CODCOBROINCLUIDO           int     `json:"codcobroincluido"`
	CODTIPIDENTIFICACIONRETIRA int     `json:"codtipidentificacionretira"`
	NUMIDENTIFICACIONRETIRA    string  `json:"numidentificacionretira"`
	NOMBRESRETIRA              string  `json:"nombresretira"`
	PiTipoReport               string  `json:"tiporeporte"`
}
