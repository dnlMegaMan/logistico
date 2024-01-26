package models

// Mensaje is...
type Mensaje struct {
	MENSAJE string `json:"mensaje"`
	ESTADO  bool   `json:"estado"`
	FOLIO   int    `json:"folio"`
}
