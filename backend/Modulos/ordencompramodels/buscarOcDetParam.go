package models

// BuscarOcEntrada is...
type BuscarOcDetEntrada struct {
	HDGCODIGO   int    `json:"hdgcodigo"`
	ESACODIGO   int    `json:"esacodigo"`
	CMECODIGO   int    `json:"cmecodigo"`
	NumOc       int    `json:"numoc"`
	Servidor    string `json:"servidor"`
	Usuario     string `json:"usuario"`
	Codigo      string `json:"codigo"`
	Descripcion string `json:"descripcion"`
}

// BuscarOcSalida is...
type BuscarOcDetSalida struct {
	OdetId             int    `json:"odetid"`
	OrcoId             int    `json:"orcoid"`
	OdetMeinId         int    `json:"odetmeinid"`
	OdetEstado         int    `json:"odetestado"`
	OdetCantReal       int    `json:"odetcantreal"`
	OdetCantDespachada int    `json:"odetcantdespachada"`
	OdetCantDevuelta   int    `json:"odetcantdevuelta"`
	OdetFechaAnula     string `json:"odetfechaanula"`
	OdetFechaCreacion  string `json:"odetfechacreacion"`
	MeinCodigo         string `json:"meincodigo"`
	MeinDesc           string `json:"meindesc"`
	OdetValorCosto     int    `json:"odetvalorcosto"`
	MeinTipo           string `json:"meintipo"`
	Mensaje            string `json:"mensaje"`
}
