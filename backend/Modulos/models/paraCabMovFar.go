package models

// ParaCabMovFar is...
type ParaCabMovFar struct {
	MovimFarID int    `json:"movimfarid"`
	HDGCodigo  int    `json:"hdgcodigo"`
	ESACodigo  int    `json:"esacodigo"`
	CMECodigo  int    `json:"cmecodigo"`
	PiUsuario  string `json:"usuario"`
	PiServidor string `json:"servidor"`
}
