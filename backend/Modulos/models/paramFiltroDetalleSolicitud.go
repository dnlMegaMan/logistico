package models

// ParamFiltroDetalleSolicitud is...
type ParamFiltroDetalleSolicitud struct{
	PiHDGCodigo int    `json:"hdgcodigo"`
	PiESACodigo int    `json:"esacodigo"`
	PiCMECodigo int    `json:"cmecodigo"`
	CodMei	    string `json:"codmei"`
	CodTipo	    int	   `json:"codtipo"`
	PiUsuario   string `json:"usuario"`
	PiServidor  string `json:"servidor"`
	FiltroDetalleSolicitud[] 	FiltroDetalleSolicitud		`json:"filtrodetallesolicitud"`
	FiltroDetallePlantillaConsumo[] FiltroDetallePlantillaConsumo	`json:"filtrodetalleplantillaConsumo"`
	FiltroDetallePlantillaBodega[] 	FiltroDetallePlantillaBodega 	`json:"filtrodetalleplantillabodega"`
	FiltroDetalleSolicitudConsumo[] FiltroDetalleSolicitudConsumo	`json:"filtrodetallesolicitudconsumo"`
	FiltroDetalleReceta[] 		RecetaDetalle	 		`json:"filtrodetallereceta"`
}