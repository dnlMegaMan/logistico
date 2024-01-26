package models

// MovimientosKardex is...
type MovimientosKardex struct {
	FechaKardex      string  `json:"fechakardex"`
	Descripcion      string  `json:"descripcion"`
	KardexOrigen     string  `json:"kardexorigen"`
	KardexDestino    string  `json:"kardexdestino"`
	Cantidad         float64 `json:"cantidad"`
	SaldoAnterior    int     `json:"saldoanterior"`
	Operacion        string  `json:"operacion"`
	IDMovimdet       int     `json:"idmovimdet"`
	IDMovimDevol     int     `json:"idmovimdevol"`
	IDMovimAjustes   int     `json:"idmovimdajustes"`
	IDMovimPrestamos int     `json:"idmovimprestamos"`
	IDMovimDevPtmo   int     `json:"idmovimdevptmo"`
	IDMovimPaciente  int     `json:"idmovimpaciente"`
	MaMeDescripcion  string  `json:"mamedescripcion"`
	Saldo            int     `json:"saldo"`
}
