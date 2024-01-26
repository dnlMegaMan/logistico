package models

// ModConsultaFraccionamiento is...
type ModConsultaFraccionamiento struct {
	HdgCodigo        int    `json:"hdgcodigo"`
	EsaCodigo        int    `json:"esacodigo"`
	CmeCodigo        int    `json:"cmecodigo"`
	Usuario          string `json:"usuario"`
	Servidor         string `json:"servidor"`
	FBodCodigo       int    `json:"fbodcodigo"`
	FechaDesde       string `json:"fechadesde"`
	FechaHasta       string `json:"fechahasta"`
	IDProdOrigen     int    `json:"idprodorigen"`
	IDProdDestino    int    `json:"idproddestino"`
	FechaHrFracc     string `json:"fechahrfracc"`
	CodOrigen        string `json:"codorigen"`
	DesOrigen        string `json:"desorigen"`
	CantOrigen       int    `json:"cantorigen"`
	Lote             string `json:"lote"`
	FechaVto         string `json:"fechavto"`
	CodDestino       string `json:"coddestino"`
	DesDestino       string `json:"desdestino"`
	CantDestino      int    `json:"cantdestino"`
	FactorConversion int    `json:"factorconversion"`
	FrmoID		 string `json:"frmoid"`
}
