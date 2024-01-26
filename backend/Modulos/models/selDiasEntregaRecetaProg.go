package models

// SelDiasEntregaRecetaProg is...
type SelDiasEntregaRecetaProg struct {
	DiasEntregaCodigo int    `json:"diasentregacodigo"`
	DiasEntregaDesc   string `json:"diasentregadesc"`
	CantEntregas      int    `json:"cantentregas"`
}
