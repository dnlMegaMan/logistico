package models

// DispensacionRecetaFST is...
type DispensacionRecetaFST struct {
	HDGCODIGO int    `json:"hdgcodigo"`
	SERVIDOR  string `json:"servidor"`
	RECEID    int    `json:"receid"`
	ESTADO    int    `json:"estado"`
}
