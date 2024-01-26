package models

// ParamInfCoberturaGeneral is...
type ParamInfCoberturaGeneral struct {
	PiTipoReport   string `json:"tiporeport"`
	PiMesesConsumo int    `json:"mesesconsumo"`
	PiDias         int    `json:"dias"`
	PiTipoReg      string `json:"tiporeg"`
	PiHdgCodigo    int    `json:"hdgcodigo"`
	PiEsaCodigo    int    `json:"esacodigo"`
	PiCmeCodigo    int    `json:"cmecodigo"`
}
