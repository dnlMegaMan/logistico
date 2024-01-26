package models

// DetalleFraccion is...
type DetalleFraccion struct {
	PdMeInCod string  `json:"demeincod"`
	PdMeInDes string  `json:"demeindes"`
	PdFactCon float64 `json:"defactcon"`
	PdStockAc int     `json:"destockactual"`
	PdMeInID  int     `json:"demeinid"`
	Campo     string  `json:"campo"`
}
