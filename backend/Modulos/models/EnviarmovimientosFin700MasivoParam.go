package models

// EnviarmovimientosFin700MasivoEntrada is...
type EnviarmovimientosFin700MasivoEntrada struct {
	Servidor   string `json:"servidor"`
	Usuario    string `json:"usuario"`
	HDGCODIGO  int    `json:"hdgcodigo"`
	ESACODIGO  int    `json:"esacodigo"`
	CMECODIGO  int    `json:"cmecodigo"`
	FechaDesde string `json:"fechaDesde"`
}

// EnviarmovimientosFin700MasivoSalida is...
type EnviarmovimientosFin700MasivoSalida struct {
	Mensaje Mensaje `json:"mensaje"`
}
