package models

// ConsultaPlantillas is...
type ConsultaPlantillas struct {
	PiServidor     string `json:"servidor"`
	PiUsuario      string `json:"usuario"`
	PHDGCodigo     int    `json:"phdgcodigo"`
	PESACodigo     int    `json:"pesacodigo"`
	PCMECodigo     int    `json:"pcmecodigo"`
	PPlanID        int    `json:"pplanid"`
	PPlanDescrip   string `json:"pplandescrip"`
	PFechaIni      string `json:"pfechaini"`
	PFechaFin      string `json:"pfechafin"`
	PBodegaOrigen  int    `json:"pbodegaorigen"`
	PBodegaDestino int    `json:"pbodegadestino"`
	PPlanVigente   string `json:"pplanvigente"`
	PSerCodigo     string `json:"pserviciocod"`
	PPlanTipo      int    `json:"pplantipo"`
	CODMEI         string `json:"codmei"`
	TipoPedido     int    `json:"tipopedido"`
}
