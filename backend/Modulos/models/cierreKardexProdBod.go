package models

// CierreKardexProdBod is...
type CierreKardexProdBod struct {
	FboiID          int    `json:"fboiid"`
	FBodCodigo      int    `json:"fbodcodigo"`
	MeinID          int    `json:"meinid"`
	MeinCodMeI      string `json:"meincodmei"`
	MeinDescri      string `json:"meindescri"`
	PactDescri      string `json:"pactdescri"`
	PresDescri      string `json:"presdescri"`
	FFarDescri      string `json:"ffardescri"`
	FboiStockActual int    `json:"fboistockactual"`
}
