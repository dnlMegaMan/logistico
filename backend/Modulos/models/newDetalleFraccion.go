package models

// NewDetalleFraccion is...
type NewDetalleFraccion struct {
	NPdMeInCod string `json:"ndemeincod"`
	NPdMeInDes string `json:"ndemeindes"`
	NPdStockAc int    `json:"ndestockactual"`
	NPBodegaID int    `json:"ndebodegaid"`
	NPdMeInID  int    `json:"ndemeinid"`
	NCampo     string `json:"ncampo"`
}
