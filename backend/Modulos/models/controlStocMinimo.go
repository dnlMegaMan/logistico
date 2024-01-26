package models

// ControlStocMinimo is...
type ControlStocMinimo struct {
	HdgCodigo           int    `json:"hdgcodigo"`
	EsaCodigo           int    `json:"esacodigo"`
	CmeCodigo           int    `json:"cmecodigo"`
	Usuario             string `json:"usuario"`
	Servidor            string `json:"servidor"`
	FechaInicio         string `json:"fechainicio"`
	FechaTermino        string `json:"fechatermino"`
	FechaMovimiento     string `json:"fechamovimiento"`
	TipoMovimiento      string `json:"tipomovimiento"`
	IDBodegaSolicita    int    `json:"idbodegasolicita"`
	NomBodegaSolicta    string `json:"nombodegasolicta"`
	IDBodegaSuministro  int    `json:"idbodegasuministro"`
	NomBodegaSuministro string `json:"nombodegasuministro"`
	IDArticulo          int    `json:"idarticulo"`
	CodigoArticulo      string `json:"codigoarticulo"`
	DescArticulo        string `json:"descarticulo"`
	CatidadSolicitada   int    `json:"catidadsolicitada"`
	CantidadDespachada  int    `json:"cantidaddespachada"`
	IDSolicitud         int    `json:"idsolicitud"`
	IDMovimiento        int    `json:"idmovimiento"`
	Cantidaddeviuelta   int    `json:"cantidaddevuelta"`
	CantidadPendiente   int    `json:"cantidadpendiente"`
	DiasDespacho        int    `json:"diasdespaho"`
}
