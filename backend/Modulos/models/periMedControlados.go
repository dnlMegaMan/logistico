package models

// PeriMedControlados is...
type PeriMedControlados struct {
	LibCID               int    `json:"libcid"`
	HDGCodigo            int    `json:"hdgcodigo"`
	CMECodigo            int    `json:"cmecodigo"`
	CodBodegaControlados int    `json:"codbodegacontrolados"`
	LibCPeriodo          int    `json:"libcperiodo"`
	LibCFechaApertura    string `json:"libcfechaapertura"`
	LibCFechaCierre      string `json:"libcfechacierre"`
	LibCUsuario          string `json:"libcusuario"`
}
