package models

type RequestAutorizaConteoInvenario struct {
	Servidor      string `json:"servidor"`
	InvId         int    `json:"invid"`
	Usuario       string `json:"usuario"`
	Observaciones string `json:"observaciones"`
}
