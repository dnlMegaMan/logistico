package models

// AEntrada is...
type GrabarFactorConversionProductoEntrada struct {
	Servidor  string                            `json:"servidor"`
	HDGCodigo int                               `json:"hdgcodigo"`
	ESACodigo int                               `json:"esacodigo"`
	CMECodigo int                               `json:"cmecodigo"`
	Usuario   string                            `json:"usuario"`
	Detalle   []FactorConversionProductoDetalle `json:"factorconversionproductodetalle"`
}

type FactorConversionProductoDetalle struct {
	PiMeInIdOrig int `json:"meinidorig"`
	PiMeInIdDest int `json:"meiniddest"`
	PiFactorConv int `json:"factorconv"`
}

// ASalida is...
type GrabarFactorConversionProductoSalida struct {
	Mensaje Mensaje `json:"mensaje"`
}
