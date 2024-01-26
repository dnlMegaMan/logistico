package models

// DatosSolicitud is...
type DatosSolicitud struct {
	SoliID           int    `json:"soliid"`
	TipoProd         string `json:"tipoprod"`
	EstadoSolCod     int    `json:"estadosolcod"`
	EstadoSolVal     string `json:"estadosolval"`
	FecHorSol        string `json:"fechorsolicitud"`
	PriorSolCod      int    `json:"PrioridadCod"`
	PriorSoldes      string `json:"PrioridadDes"`
	PacienteSol      string `json:"pacientesol"`
	ServicioOriCod   int    `json:"serviciooricod"`
	ServicioOriDes   string `json:"servicioorides"`
	ServicioDesCod   int    `json:"serviciodescod"`
	ServicioDesDes   string `json:"serviciodesdes"`
	PacienteTipoDoc  string `json:"pacientetipodoc"`
	PacienteRut      string `json:"pacienterut"`
	PacientePPN      int    `json:"pacienteppn"`
	PacienteCtaCte   int    `json:"pacientectacte"`
	PacienteEstadia  int    `json:"pacienteestadia"`
	PacienteEdad     int    `json:"pacienteedad"`
	PacienteTipoEdad string `json:"pacientetipoedad"`
	PacienteCodSexo  int    `json:"pacientecodsexo"`
	PacienteDesSexo  string `json:"pacientedessexo"`
	PacienteConvenio string `json:"pacienteconvenio"`
	EstadiaDesDiag   string `json:"estadiaestdiag"`
	AmbitoSolCod     int    `json:"ambitosolcod"`
	AmbitoSolDes     string `json:"ambitosoldes"`
	MedicoTratante   string `json:"medicotratante"`
	SoliCtaCteID     int    `json:"ctacteid"`
	ClienteID        int    `json:"clienteid"`
	Campo            string `json:"campo"`
	SOLIHDGCODIGO    int    `json:"hdgcodigo"`
	SOLIESACODIGO    int    `json:"esacodigo"`
	SOLICMECODIGO    int    `json:"cmecodigo"`
}
