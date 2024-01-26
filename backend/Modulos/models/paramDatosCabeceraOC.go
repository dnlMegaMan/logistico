package models

// ParamDatosCabeceraOC is...
type ParamDatosCabeceraOC struct {
	NumeroRutProv    int    `json:"numerorutprov"`
	TipoDoctoID      int    `json:"tipodoctoid"`
	NumeroDocRecep   int    `json:"numerodocrecep"`
	FechaDocRecepDes string `json:"fechadocrecepdes"`
	FechaDocRecepHas string `json:"fechadocrecephas"`
	PiUsuario        string `json:"usuario"`
	PiServidor       string `json:"servidor"`
}
