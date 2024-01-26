package models

type InformacionGeneralEntrada struct {
	Servidor string `json:"servidor"`
	// HDGCodigo int    `json:"hdgcodigo,omitempty"`
	// ESACodigo int    `json:"esacodigo,omitempty"`
	// CMECodigo int    `json:"cmecodigo,omitempty"`
	// Usuario   string `json:"usuario,omitempty"`
}

type InformacionGeneral struct {
	VersionAngular      string `json:"versionAngular"`
	VersionGo           string `json:"versionGo"`
	RedirigirCaidaGO    string `json:"redirigirCaidaGO"`
	SistemaEnMantencion string `json:"sistemaEnMantencion"`
}
