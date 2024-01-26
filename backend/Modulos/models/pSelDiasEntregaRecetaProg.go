package models

// PSelDiasEntregaRecetaProg is...
type PSelDiasEntregaRecetaProg struct {
	HDGCodigo int    `json:"hdgcodigo"`
	CMECodigo int    `json:"cmecodigo"`
	ESACodigo int    `json:"esacodigo"`
	Servidor  string `json:"servidor"`
	Usuario   string `json:"usuario"`
}
