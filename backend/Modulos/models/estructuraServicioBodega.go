package models

// EstructuraServicioBodega is...
type EstructuraServicioBodega struct {
	HDGCODIGO     int    `json:"hdgcodigo"`
	ESACODIGO     int    `json:"esacodigo"`
	CMECODIGO     int    `json:"cmecodigo"`
	BSSERVID      int    `json:"bsservid"`
	BSFBODCODIGO  int    `json:"bsfbodcodigo"`
	BSVIGENTE     string `json:"bsvigente"`
	CODUNIDAD     string `json:"codunidad"`
	GLOSASERVICIO string `json:"glosaservicio"`
	GLOSAUNIDAD   string `json:"glosaunidad"`
	SERVCODIGO    string `json:"servcodigo"`
	SERVIDOR      string `json:"servidor"`
}
