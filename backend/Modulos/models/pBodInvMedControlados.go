package models

// PBodInvMedControlados is...
type PBodInvMedControlados struct {
	Servidor             string `json:"servidor"`
	HDGCodigo            int    `json:"hdgcodigo"`
	ESACodigo            int    `json:"esacodigo"`
	CMECodigo            int    `json:"cmecodigo"`
	CodBodegaControlados int    `json:"codbodegacontrolados"`
}
