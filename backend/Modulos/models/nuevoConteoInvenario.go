package models

type RequestNuevoConteoInvenario struct {
	Servidor        string `json:"servidor"`
	InvId           int    `json:"invid"`
	HabilitarConteo int    `json:"habilitarconteo"`
}
