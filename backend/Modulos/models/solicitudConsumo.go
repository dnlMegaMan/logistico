package models

// SolicitudConsumo is...
type SolicitudConsumo struct {
	ACCION              string                    `json:"accion"`
	ID                  int                       `json:"id"`
	HDGCODIGO           int                       `json:"hdgcodigo"`
	ESACODIGO           int                       `json:"esacodigo"`
	CMECODIGO           int                       `json:"cmecodigo"`
	CENTROCOSTO         int                       `json:"centrocosto"`
	IDPRESUPUESTO       int                       `json:"idpresupuesto"`
	GLOSA               string                    `json:"glosa"`
	FECHASOLICITUD      string                    `json:"fechasolicitud"`
	FECHAENVIOSOLICITUD string                    `json:"fechaenviosolicitud"`
	REFERENCIACONTABLE  int                       `json:"referenciacontable"`
	OPERACIONCONTABLE   int                       `json:"operacioncontable"`
	ESTADO              int                       `json:"estado"`
	PRIORIDAD           int                       `json:"prioridad"`
	USUARIOSOLICITA     string                    `json:"usuariosolicita"`
	USUARIOAUTORIZA     string                    `json:"usuarioautoriza"`
	CODMEI				string					  `json:"codmei"`
	DETSOLICTUDCONSUMO  []DetalleSolicitudConsumo `json:"detsolicitudconsumo"`
	USUARIO             string                    `json:"usuario"`
	SERVIDOR            string                    `json:"servidor"`
	FECHADESDE          string                    `json:"fechadesde"`
	FECHAHASTA          string                    `json:"fechahasta"`
	GLOSACENTROCOSTO    string                    `json:"glosacentrocosto"`
	GLOSAESTADO         string                    `json:"glosaestado"`
	GLOSAPRIORIDAD      string                    `json:"glosaprioridad"`
	ERRORERP            string                    `json:"errorerp"`
	MARCA               bool                      `json:"marca"`
}

// DetalleSolicitudConsumo is...
type DetalleSolicitudConsumo struct {
	ACCION               string `json:"accion"`
	IDDETAELLE           int    `json:"iddetalle"`
	ID                   int    `json:"id"`
	CENTROCOSTO          int    `json:"centrocosto"`
	IDPRESUPUESTO        int    `json:"idpresupuesto"`
	IDPRODUCTO           int    `json:"idproducto"`
	CODIGOPRODUCTO       string `json:"codigoproducto"`
	GLOSAPRODUCTO        string `json:"glosaproducto"`
	CANTIDADSOLICITADA   int    `json:"cantidadsolicitada"`
	CANTIDADRECEPCIONADA int    `json:"cantidadrecepcionada"`
	REFERENCIACONTABLE   int    `json:"referenciacontable"`
	OPERACIONCONTABLE    int    `json:"operacioncontable"`
	ESTADO               int    `json:"estado"`
	PRIORIDAD            int    `json:"prioridad"`
	USUARIOSOLICITA      string `json:"usuariosolicita"`
	USUARIOAUTORIZA      string `json:"usuarioautoriza"`
	USUARIO              string `json:"usuario"`
	SERVIDOR             string `json:"servidor"`
	GLOSAUNIDADCONSUMO   string `json:"glosaunidadconsumo"`
}
