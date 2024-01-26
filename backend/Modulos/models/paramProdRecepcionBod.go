package models

// ParamProdRecepcionBod is...
type ParamProdRecepcionBod struct {
	PiHDGCodigo int    `json:"hdgcodigo"`
	PiESACodigo int    `json:"esacodigo"`
	PiCMECodigo int    `json:"cmecodigo"`
	PiServidor  string `json:"servidor"`
	PiSoliID    int    `json:"soliid"`
	PiCodMei    string `json:"codmei"`
	PiLote      string `json:"lote"`
	PiFechaVto  string `json:"fechavto"`
}
