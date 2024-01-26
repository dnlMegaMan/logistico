package models

// ListaDePacientesAmbito is...
type ListaDePacientesAmbito struct {
	CliID              int    `json:"cliid"`
	DescIdentificacion string `json:"glstipidentificacion"`
	DocuIdentificacion string `json:"numdocpac"`
	Paterno            string `json:"apepaternopac"`
	Materno            string `json:"apematernopac"`
	Nombres            string `json:"nombrespac"`
	Sexo               string `json:"glsexo"`
	FechaNacimiento    string `json:"fechanacimiento"`
	UnidadActual       string `json:"undglosa"`
	PiezaActual        string `json:"pzagloza"`
	CamaActual         string `json:"camglosa"`
	PaternoMedico      string `json:"paternomedico"`
	MaternoMedico      string `json:"maternomedico"`
	NombresMedico      string `json:"nombresmedico"`
	NumeroCuenta       string `json:"cuentanumcuenta"`
	NumeroEstadia      int    `json:"numeroestadia"`
	NombreMedico       string `json:"nombremedico"`
	Edad               string `json:"edad"`
	Glsambito          string `json:"glsambito"`
	Tipodocpac         int    `json:"tipodocpac"`
	Codsexo            int    `json:"codsexo"`
	CtaID              int    `json:"ctaid"`
	Codservicioori     int    `json:"codservicioori"`
	Codpieza           string `json:"codpieza"`
	CamID              int    `json:"camid"`
	PiezaID            int    `json:"piezaid"`
	EstID              int    `json:"estid"`
	Tipodocprof        int    `json:"tipodocprof"`
	Numdocprof         string `json:"numdocprof"`
	CodServicioActual  string `json:"codservicioactual"`
	GlsServicioActual  string `json:"glsservicioactual"`
	CodAmbito          int    `json:"codambito"`
	FechaHospitaliza   string `json:"fechahospitaliza"`
	PlanCotizante      string `json:"plancotizante"`
	Bonificacion       string `json:"bonificacion"`
}
