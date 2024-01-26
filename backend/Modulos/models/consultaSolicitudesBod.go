package models

// ConsultaSolicitudesBod is...
type ConsultaSolicitudesBod struct {
	PSBODID              int     `json:"psbodid"`
	PHDGCodigo           int     `json:"phdgcodigo"`
	PESACodigo           int     `json:"pesacodigo"`
	PCMECodigo           int     `json:"pcmecodigo"`
	PTipoSolicitud       int     `json:"ptiposolicitud"`
	PFechaIni            string  `json:"pfechaini"`
	PFechaFin            string  `json:"pfechacfin"`
	PBodegaOrigen        int     `json:"pbodegaorigen"`
	PBodegaDestino       int     `json:"pbodegadestino"`
	PEstCod              int     `json:"pestcod"`
	PiServidor           string  `json:"servidor"`
	PPrioridad           int     `json:"prioridad"`
	PAmbito              int     `json:"ambito"`
	PIDUnidad            int     `json:"unidadid"`
	PIDPieza             int     `json:"piezaid"`
	PIDCama              int     `json:"camid"`
	PDocIdentCodigo      int     `json:"TipDocId"`
	PoNumDocPac          string  `json:"numdocpac"`
	Pcliid               float64 `json:"cliid"`
	FiltroDeNegocio      string  `json:"filtrodenegocio"`
	SOLIORIGEN           int     `json:"soliorigen"`
	PUsuario             string  `json:"usuario"`
	CODMEI               string  `json:"codmei"`
	MeinDescri           string  `json:"meindescri"`
	PaginaOrigen         int     `json:"paginaorigen"`
	CodServicioActual    string  `json:"codservicioactual"`
	ReceID               int     `json:"receid"`
	TipoIdentificacion   int     `json:"tipoidentificacion"`
	NumeroIdentificacion string  `json:"numeroidentificacion"`
	NombrePaciente       string  `json:"nombrepaciente"`
	ApellidoPaterno      string  `json:"apellidopaterno"`
	ApellidoMaterno      string  `json:"apellidomaterno"`
	FecDevolucion        string  `json:"fecdevolucion"`
}
