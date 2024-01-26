package models

// ClinFarGrupoConsumo is...
type ClinFarGrupoConsumo struct {
	ACCION           string `json:"accion"`
	GRUPOID          int    `json:"grupoid"`
	HDGCODIGO        int    `json:"hdgcodigo"`
	ESACODIGO        int    `json:"esacodigo"`
	CMECODIGO        int    `json:"cmecodigo"`
	GRUPOCODIGO      string `json:"grupocodigo"`
	GRUPODESCRIPCION string `json:"grupodescripcion"`
	USUARIO          string `json:"usuario"`
	SERVIDOR         string `json:"servidor"`
}
