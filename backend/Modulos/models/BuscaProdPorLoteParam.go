package models

// BuscaProdPorLoteEntra is...
type BuscaProdPorLoteEntra struct {
	Servidor         string `json:"servidor"`
	HDGCodigo        int    `json:"hdgcodigo"`
	ESACodigo        int    `json:"esacodigo"`
	CMECodigo        int    `json:"cmecodigo"`
	Usuario          string `json:"usuario"`
	Lote             string `json:"lote"`
	FechaVencimiento string `json:"fechavencimiento"`
}

// BuscaProdPorLoteSalida is...
type BuscaProdPorLoteSalida struct {
	HDGCodigo      int     `json:"hdgcodigo"`
	ESACodigo      int     `json:"esacodigo"`
	CMECodigo      int     `json:"cmecodigo"`
	MeinID         int     `json:"meinid"`
	CodMei         string  `json:"codmei"`
	MeinDescri     string  `json:"meindescri"`
	TipoReg        string  `json:"tiporeg"`
	TipoMed        int     `json:"tipomed"`
	Valorcosto     float64 `json:"valorcosto"`
	Margen         int     `json:"margenmedicamento"`
	Valorventa     float64 `json:"valorventa"`
	Unidadcompra   int     `json:"unidadcompra"`
	Unidaddespacho int     `json:"unidaddespacho"`
	Incobfonasa    string  `json:"incobfonasa"`
	Tipoincob      string  `json:"tipoincob"`
	Estado         int     `json:"estado"`
	Clasificacion  int     `json:"clasificacion"`
	Recetaretenida string  `json:"recetaretenida"`
	Solocompra     string  `json:"solocompra"`
	Preparados     string  `json:"preparados"`
	Familia        int     `json:"familia"`
	Subfamilia     int     `json:"subfamilia"`
	CodigoPact     int     `json:"codpact"`
	CodigoPres     int     `json:"codpres"`
	CodigoFFar     int     `json:"codffar"`
	Controlado     string  `json:"controlado"`
	Saldo          int     `json:"saldo"`
	CodBodega      int     `json:"codbodega"`
	BodDescripcion string  `json:"boddescripcion"`
	Mensaje        string  `json:"mensaje"`
}
