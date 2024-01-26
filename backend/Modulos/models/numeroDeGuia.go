package models

// NumeroDeGuia is...
type NumeroDeGuia struct {
	NumeroDocOc    int    `json:"numerodococ"`
	FechaRecepcion string `json:"fecharecepcion"`
	Cantidad       int    `json:"cantidad"`
	Responsable    string `json:"responsable"`
	ProveedorID    int    `json:"proveedorid"`
	TipDocID       int    `json:"tipdocid"`
}
