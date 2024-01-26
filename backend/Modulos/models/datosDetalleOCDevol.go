package models

// DatosDetalleOCDevol is...
type DatosDetalleOCDevol struct {
	GuiaMontoTotal   float64 `json:"guiamontototal"`
	GuiaCantidadItem int     `json:"guiacantidaditem"`
	GuiaFechaEmision string  `json:"guiafechaemision"`
	OcDetCodMei      string  `json:"ocdetcodmei"`
	OcDetCodDes      string  `json:"ocdetcoddes"`
	OcDetValCosto    float64 `json:"ocdetvalcosto"`
	OcDetCant        int     `json:"ocdetcant"`
	OcDetCantDev     int     `json:"ocdetcantdev"`
	OcDetMovID       int     `json:"ocdetmovid"`
	OcDetMovDetID    int     `json:"ocdetmovdetid"`
	OcDetMeInID      int     `json:"ocdetmeinid"`
	OcDetMfDeID      int     `json:"ocdetmfdeid"`
	OcCantaDevol     int     `json:"occantadevol"`
}
