package models

// ConsultaConsumoLotesEntra is...
type ConsultaConsumoLotesEntra struct {
	Servidor         string `json:"servidor"`
	Usuario          string `json:"usuario"`
	HDGCodigo        int    `json:"phdgcodigo"`
	ESACodigo        int    `json:"pesacodigo"`
	CMECodigo        int    `json:"pcmecodigo"`
	Lote             string `json:"Lote"`
	MeinID           int    `json:"MeinID"`
	FechaInicio      string `json:"FechaInicio"`
	FechaTermino     string `json:"FechaTermino"`
	TipoConsulta     int    `json:"TipoConsulta"`
	TiposMovimientos []int  `json:"TiposMovimiento"`
}

// ConsultaConsumoLotesSalida is...
type ConsultaConsumoLotesSalida struct {
	MFDEFECHA            string `json:"mfdefecha"`
	CODTIPIDENTIFICACION int    `json:"codtipidentificacion"`
	GLSTIPIDENTIFICACION string `json:"glstipidentificacion"`
	CLINUMIDENTIFICACION string `json:"clinumidentificacion"`
	CUENTAID             int    `json:"cuentaid"`
	CLIAPEPATERNO        string `json:"cliapepaterno"`
	CLIAPEMATERNO        string `json:"cliapematerno"`
	CLINOMBRES           string `json:"clinombres"`
	NOMCOMPLETOPAC       string `json:"nomcompletopac"`
	SERVCODIGO           string `json:"servcodigo"`
	SERVDESCRIPCION      string `json:"servdescripcion"`
	SOLIID               int    `json:"soliid"`
	MFDECANTIDAD         int    `json:"mfdecantidad"`
	FBODDESCRIPCION      string `json:"fboddescripcion"`
	SALDO                int    `json:"saldo"`
	MENSAJE              string `json:"mensaje"`
}
