package models

// ParamGrabaDetallesOC is...
type ParamGrabaDetallesOC struct {
	NumeroDocOc      int     `json:"numerodococ"`
	OcDetTipoItem    string  `json:"ocdettipoitem"`
	OcDetMeInID      int     `json:"ocdetmeinid"`
	OcDetCantCalc    int     `json:"ocdetcantcalc"`
	OcDetCantReal    int     `json:"ocdetcantreal"`
	OcFechaAnulacion string  `json:"ocfechaanulacion"`
	OcDetValCosto    float64 `json:"ocdetvalcosto"`
	OcOrCoID         int     `json:"orcoid"`
	PiUsuario        string  `json:"usuario"`
	PiServidor       string  `json:"servidor"`
}
