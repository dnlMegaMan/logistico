package models

// ListaCobroMedicamentoEntrada is...
type ListaCobroMedicamentoEntrada struct {
	Servidor  string `json:"servidor"`
	HDGCodigo int    `json:"hdgcodigo"`
	ESACodigo int    `json:"esacodigo"`
	CMECodigo int    `json:"cmecodigo"`
	Usuario   string `json:"usuario"`
}

// ListaCobroMedicamentoSalida is...
type ListaCobroMedicamentoSalida struct {
	Codigo      int    `json:"codigo"`
	Descripcion string `json:"descripcion"`
	Mensaje     string `json:"mensaje"`
}
