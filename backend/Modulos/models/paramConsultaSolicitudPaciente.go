package models

// ParamConsultaSolicitudPaciente is...
type ParamConsultaSolicitudPaciente struct {
	SERVIDOR       string `json:"servidor"`
	HDGCODIGO      int    `json:"hdgcodigo"`
	ESACODIGO      int    `json:"esacodigo"`
	CMECODIGO      int    `json:"cmecodigo"`
	CUENTA         string `json:"cuentaid"`
	ESTID          string `json:"estid"`
	NUMRECETA      string `json:"numreceta"`
	SODEMEINCODMEI string `json:"meincodmei"`
	NROSOLICITUD   string `json:"nrosolicitud"`
	FECHADESDE     string `json:"fechadesde"`
	FECHAHASTA     string `json:"fechahasta"`
}
