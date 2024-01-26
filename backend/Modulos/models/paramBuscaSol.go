package models

// ParambuscaSol is...
type ParambuscaSol struct {
	PiHDGCodigo     int    `json:"hdgcodigo"`
	PiESACodigo     int    `json:"esacodigo"`
	PiCMECodigo     int    `json:"cmecodigo"`
	PiFechaDesde    string `json:"fechadesde"`
	PiFechaHasta    string `json:"fechahasta"`
	PiAmbito        int    `json:"ambito"`
	PiTipoReg       string `json:"tiporeg"`
	PiEstadoSol     int    `json:"estadosol"`
	PiServicio      int    `json:"servicio"`
	PiIdentifica    int    `json:"identificacion"`
	PiIdentificaDoc string `json:"identificaciondoc"`
	PiUsuario       string `json:"usuario"`
	PiServidor      string `json:"servidor"`
}
