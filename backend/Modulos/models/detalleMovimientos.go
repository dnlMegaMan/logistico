package models

// DetalleMovimientos is...
type DetalleMovimientos struct {
	Fechamov         string `json:"fechamovim"`
	HoraMov          string `json:"horamovim"`
	Usuario          string `json:"usuario"`
	BodegaOrigenDes  string `json:"bodegaorigendes"`
	BodegaDestinoDes string `json:"bodegadestinodes"`
	RUTProveedor     int    `json:"rutproveedor"`
	DVProveedor      string `json:"dvproveedor"`
	ProveedorDesc    string `json:"proveedordesc"`
	TipoDocumentoDes string `json:"tipodocumentodes"`
	NumeroDocumento  int    `json:"numerodocumento"`
	IDSolicitud      int    `json:"idsolicitud"`
	NumeroReceta     int    `json:"numeroreceta"`
	IDHojaGasto      int    `json:"idhojagasto"`
	NumeroBoleta     int    `json:"numeroboleta"`
	IDEstadia        int    `json:"idEstadia"`
	RUTPaciente      string `json:"rutpaciente"`
	NombrePaciente   string `json:"nombrepaciente"`
	TipoMovimDes     string `json:"tipomovimdes"`
	MovimCantidad    int    `json:"movimcantidad"`
	MovimCantidadDev int    `json:"movimcantidaddev"`
	IDMovimiento     int    `json:"idmovimiento"`
	StockAnterior    int    `json:"stockanterior"`
	StockNuevo       int    `json:"stocknuevo"`
	ValCosAnterior   int    `json:"valcosanterior"`
	ValCosNuevo      int    `json:"valcosnuevo"`
	ValVentAnterior  int    `json:"valventanterior"`
	ValVentNuevo     int    `json:"valventnuevo"`
	BodExteriorOrig  string `json:"bodexteriororig"`
	BodExteriorDest  string `json:"bodexteriordest"`
	Observaciones    string `json:"observaciones"`
	TipoPrestamo     string `json:"tipoprestamo"`
}
