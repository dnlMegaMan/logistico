package models

// EstructuraProductosDemanda is...
type EstructuraProductosDemanda struct {
	CodMei          string `json:"codmei"`
	MeinDescri      string `json:"meindescri"`
	CUM             string `json:"cum"`
	Stock           int    `json:"stock"`
	StockMax        int    `json:"stockmax"`
	StockMin        int    `json:"stockmin"`
	StockCritico    int    `json:"stockcritico"`
	NivelReposicion int    `json:"nivelreposicion"`
}
