package models

// RecetaDetalle is...
type RecetaDetalle struct {
	SERVIDOR           string `json:"servidor"`
	FECHAINICIO        string `json:"fechainicio"`
	FECHAHASTA         string `json:"fechahasta"`
	RECEID             int    `json:"receid"`
	REDEID             int    `json:"redeid"`
	HDGCODIGO          int    `json:"hdgcodigo"`
	ESACODIGO          int    `json:"esacodigo"`
	CMECODIGO          int    `json:"cmecodigo"`
	REDEMEINCODMEI     string `json:"redemeincodmei"`
	REDEMEINDESCRI     string `json:"redemeindescri"`
	REDEDOSIS          int    `json:"rededosis"`
	REDEVECES          int    `json:"redeveces"`
	REDETIEMPO         int    `json:"redetiempo"`
	REDEGLOSAPOSOLOGIA string `json:"redeglosaposologia"`
	REDECANTIDADSOLI   int    `json:"redecantidadsolo"`
	REDECANTIDADADESP  int    `json:"redecantidadadesp"`
	MEINID             int    `json:"meinid"`
	MEINTIPOREG        string `json:"meintiporeg"`
	MEINCONTROLADO     string `json:"meincontrolado"`
	CANTIDADPAGADACAJA int	  `json:"cantidadpagadacaja"`
}
