package models

// DetalleOCDevol is...
type DetalleOCDevol struct {
	OcDetMeInID      int    `json:"ocdetmeinid"`
	OcDetCodDes      string `json:"ocdetcoddes"`
	OcDetFechaDev    string `json:"ocdetfechadev"`
	OcDetCantDev     int    `json:"ocdetcantdev"`
	OcDetResponsable string `json:"ocdetresponsable"`
	OcDetnroDocto    int    `json:"ocdetnrodocto"`
}
