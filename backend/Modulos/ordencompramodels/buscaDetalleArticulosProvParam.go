package models

// BuscarOcEntrada is...
type BuscaDetalleArticulosProvEntrada struct {
	HDGCODIGO int    `json:"hdgcodigo"`
	ESACODIGO int    `json:"esacodigo"`
	CMECODIGO int    `json:"cmecodigo"`
	Servidor  string `json:"servidor"`
	Proveedor int    `json:"proveedor"`
}

// BuscarOcSalida is...
type BuscaDetalleArticulosProvSalida struct {
	MeinId        int    `json:"meinid"`
	MeinCodigo    string `json:"meincodigo"`
	MeinDesc      string `json:"meindesc"`
	MeinTipo      string `json:"meintipo"`
	FechaCreacion string `json:"fechacreacion"`
	ProvId        int    `json:"provid"`
	Plazo         int    `json:"plazo"`
	Valor         int    `json:"valor"`
	Mensaje       string `json:"mensaje"`
}
