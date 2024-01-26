package models

// Ocdetalle is...
type Ocdetalle struct {
	OcDetID          int     `json:"ocdetid"`
	HDGCodigo        int     `json:"hdgcodigo"`
	ESACodigo        int     `json:"esacodigo"`
	CMECodigo        int     `json:"cmecodigo"`
	OcDetEstado      int     `json:"ocdetestado"`
	OcDetEstDes      string  `json:"ocdetestdes"`
	OcDetMeInID      int     `json:"ocdetmeinid"`
	OcDetCodMei      string  `json:"ocdetcodmei"`
	OcDetCodDes      string  `json:"ocdetcoddes"`
	OcDetTipoItem    string  `json:"ocdettipoitem"`
	OcDetCantReal    int     `json:"ocdetcantreal"`
	OcDetCantDev     int     `json:"ocdetcantdev"`
	OcDetCantMovi    int     `json:"ocdetcantmovi"`
	OcDetValCosto    float64 `json:"ocdetvalcosto"`
	OcDetValUnita    float64 `json:"ocdetvalunita"`
	OcDetCantRecep   int     `json:"ocdetcantrecep"`
	FechaVencimiento string  `json:"fechavencimiento"`
	Campo            string  `json:"campo"`
}
