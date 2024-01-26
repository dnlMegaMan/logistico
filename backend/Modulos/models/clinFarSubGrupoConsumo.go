package models

// ClinFarSubGrupoConsumo is...
type ClinFarSubGrupoConsumo struct {
	ACCION              string `json:"accion"`
	SUBGRUPOID          int    `json:"subgrupoid"`
	GRUPOID             int    `json:"grupoid"`
	HDGCODIGO           int    `json:"hdgcodigo"`
	ESACODIGO           int    `json:"esacodigo"`
	CMECODIGO           int    `json:"cmecodigo"`
	SUBGRUPOCODIGO      string `json:"subgrupocodigo"`
	SUBGRUPODESCRIPCION string `json:"subgrupodescripcion"`
	USUARIO             string `json:"usuario"`
	SERVIDOR            string `json:"servidor"`
}
