package models

// RetornoUsuario is...
type RetornoUsuario struct {
	IDUsuario int    `json:"userid"`
	HDGCodigo int    `json:"hdgcodigo"`
	HDGNombre string `json:"hdgnombre"`
	ESACodigo int    `json:"esacodigo"`
	ESANombre string `json:"esanombre"`
	CMECodigo int    `json:"cmecodigo"`
	CMENombre string `json:"cmenombre"`
	Token     string `json:"token"`
}
