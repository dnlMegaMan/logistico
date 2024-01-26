package models

// PAjusteStockManual is...
type PAjusteStockManual struct {
	PiHDGCodigo     int    `json:"hdgcodigo"`
	PiESACodigo     int    `json:"esacodigo"`
	PiCMECodigo     int    `json:"cmecodigo"`
	PiServidor      string `json:"servidor"`
	PiUsuario       string `json:"usuario"`
	PiBodCodigo     int    `json:"bodcodigo"`
	PiMeinID        int    `json:"meinid"`
	PiMeinCod       string `json:"meincod"`
	PiStockAnterior int    `json:"stockanterior"`
	PiStockNuevo    int    `json:"stocknuevo"`
	PiMotivoAjuste  int    `json:"motivoajuste"`
}
