package models

// DetalleDeTraspaso is...
type DetalleDeTraspaso struct {
	IDTraspaso    int    `json:"idtraspaso"`
	MeInCodMeI    string `json:"meincodmei"`
	MeInID        int    `json:"meinid"`
	MeInDescri    string `json:"meindescri"`
	CantidadSolic int    `json:"cantidadsolic"`
	Campo         string `json:"campo"`
}
