package models

// BuscaOrdenesC is...
type BuscaOrdenesC struct {
	OrCoID          int    `json:"orcoid"`
	HDGCodigo       int    `json:"hdgcodigo"`
	ESACodigo       int    `json:"esacodigo"`
	CMECodigo       int    `json:"cmecodigo"`
	NumeroDocOC     int    `json:"numerodococ"`
	FechaDocOC      string `json:"fechadococ"`
	EstadoOC        int    `json:"estadooc"`
	DescEstadoOC    string `json:"descestadooc"`
	ProveedorID     int    `json:"proveedorid"`
	NumeroRutProv   int    `json:"numerorutprov"`
	DvRutProv       string `json:"dvrutprov"`
	DescripcionProv string `json:"descripcionprov"`
}
