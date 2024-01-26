package models

// MovimientosFarmacia is...
type MovimientosFarmacia struct {
	MovimFarID               int                      `json:"movimfarid"`
	HdgCodigo                int                      `json:"hdgcodigo"`
	EsaCodigo                int                      `json:"esacodigo"`
	CmeCodigo                int                      `json:"cmecodigo"`
	MovTipo                  int                      `json:"tipomov"`
	MovimFecha               string                   `json:"movimfecha"`
	PiUsuario                string                   `json:"usuario"`
	SoliID                   int                      `json:"soliid"`
	BodegaOrigen             int                      `json:"bodegaorigen"`
	BodegaDestino            int                      `json:"bodegadestino"`
	EstID                    int                      `json:"estid"`
	ProveedorID              int                      `json:"proveedorid"`
	OrcoNumDoc               int                      `json:"orconumdoc"`
	NumeroGuia               int                      `json:"numeroguia"`
	NumeroReceta             int                      `json:"numeroreceta"`
	FechaDocumento           string                   `json:"fechadocumento"`
	CantidadMov              int                      `json:"cantidadmov"`
	ValorTotal               int                      `json:"valortotal"`
	CliID                    int                      `json:"cliid"`
	FechaGrabacion           string                   `json:"fechagrabacion"`
	ServicioCargoID          int                      `json:"serviciocargoid,string"`
	GuiaTipoDcto             int                      `json:"guiatipodcto"`
	FolioUrgencia            int                      `json:"foliourgencia"`
	NumBoleta                int                      `json:"numeroboletacaja"`
	MotivoCargoID            int                      `json:"motivocargoid"`
	PacAmbulatorio           string                   `json:"pacambulatorio"`
	TipoFormuHCFAR           int                      `json:"tipoformuhcfar"`
	CuentaID                 int                      `json:"cuentaid"`
	ClienteRut               string                   `json:"clienterut"`
	ClientePaterno           string                   `json:"clientepaterno"`
	ClienteMaterno           string                   `json:"clientematerno"`
	ClienteNombres           string                   `json:"clientenombres"`
	ProveedorRUT             string                   `json:"proveedorrut"`
	ProveedorDesc            string                   `json:"proveedordesc"`
	MovimDescr               string                   `json:"movimudescr"`
	BodegaDescr              string                   `json:"bodegadescr"`
	BodegaDestinoDes         string                   `json:"bodegadestinodes"`
	MovComprobanteCaja       string                   `json:"comprobantecaja"`
	MovEstadoComprobanteCaja int                      `json:"estadocomprobantecaja"`
	GlosaEstadoCaja          string                   `json:"glosaestadocaja"`
	Servidor                 string                   `json:"servidor"`
	MovFarIDDespachoDevArt   int                      `json:"movfaridedspachodevart"`
	Detalle                  []MovimientosFarmaciaDet `json:"movimientosfarmaciadet"`
}
