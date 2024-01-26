package models

// ListaDePacientes is...
type ListaDePacientes struct {
	TipoIdentificacion int     `json:"tipoidentificacion"`
	DescIdentificacion string  `json:"descidentificacion"`
	DocuIdentificacion string  `json:"docuidentificacion"`
	Paterno            string  `json:"apepaternopac"`
	Materno            string  `json:"apematernopac"`
	Nombres            string  `json:"nombrespac"`
	Sexo               string  `json:"glsexo"`
	FechaNacimiento    string  `json:"fechanacimiento"`
	FechaHospitaliza   string  `json:"fechahospitaliza"`
	FechaAlta          string  `json:"fechaalta"`
	CamaActual         string  `json:"camaactual"`
	EstadoHospitaliza  string  `json:"estadohospitaliza"`
	CodPaisNacimiento  int     `json:"codpaisnacimiento"`
	Direccion          string  `json:"direccion"`
	Comuna             string  `json:"comuna"`
	FonoFijo           string  `json:"fonofijo"`
	FonoMovil          string  `json:"fonomovil"`
	CliID              float64 `json:"cliid"`
	Codsexo            int     `json:"codsexo"`
	Edad               string  `json:"edad"`
	UnidadActual       string  `json:"undglosa"`
	CodServicioActual  string  `json:"codservicioactual"`
	CodAmbito          int     `json:"codambito"`
	ESTID              int     `json:"estid"`
	CTAID              int     `json:"ctaid"`
	PlanCotizante      string  `json:"plancotizante"`
	Bonificacion       string  `json:"bonificacion"`
}
