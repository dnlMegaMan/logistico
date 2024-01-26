package models

// BuscaLotesEntra is...
type BuscaLotesEntra struct {
	Servidor		  string `json:"servidor"`
	HDGCodigo         int    `json:"hdgcodigo"`
	ESACodigo         int    `json:"esacodigo"`
	CMECodigo         int    `json:"cmecodigo"`
	Lote              string `json:"lote"`
	MeinID            int    `json:"meinid"`
	CodBodega         string `json:"codbodega"`
	FechaInicio       string `json:"fechainicio"`
	FechaTermino      string `json:"fechatermino"`	
	Saldo             int    `json:"saldo"`
}

// BuscaLotesSalida is...
type BuscaLotesSalida struct {
	NOMBRE            string `json:"nombre"`
	MEINID            int    `json:"meinid"`
	CODMEI            string `json:"codmei"`
	MEINDESCRI        string `json:"meindescri"`
	FBODCODIGO        string `json:"fbodcodigo"`
	FBODDESCRIPCION   string `json:"fboddescripcion"`
	SALDO			  int    `json:"saldo"`
	FECHAVENCIMIENTO  string `json:"fechavencimiento"`
	MENSAJE			  string `json:"mensaje"`
}
