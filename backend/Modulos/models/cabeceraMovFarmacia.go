package models

// CabeceraMovFarmacia is...
type CabeceraMovFarmacia struct {
	MovimFarID       int    `json:"movimfarid"`
	MovimFecha       string `json:"movimfecha"`
	MovTipo          int    `json:"tipomov"`
	EstID            int    `json:"estid"`
	ClienteRut       int    `json:"clienterut"`
	DVRutPaciente    string `json:"dvrutpaciente"`
	ClienteNombre    string `json:"clientenombre"`
	NumBoleta        int    `json:"numeroboletacaja"`
	PacAmbulatorio   string `json:"pacambulatorio"`
	ProveedorID      int    `json:"proveedorid"`
	ProveedorRUT     int    `json:"proveedorrut"`
	ProveedorDV      string `json:"proveedordv"`
	ProveedorDesc    string `json:"proveedordesc"`
	BodegaOrigenDes  int    `json:"bodegaorigendes"`
	BodegaDestinoDes int    `json:"bodegadestinodes"`
	ServicioCargoID  int    `json:"serviciocargoid"`
	NumeroGuia       int    `json:"numeroguia"`
	FechaDocumento   string `json:"fechadocumento"`
	Receta           int    `json:"numeroreceta"`
	GuiaTipoDcto     int    `json:"guiatipodcto"`
	DetalleMovID     int    `json:"detallemovid"`
	CodigoMeIn       string `json:"codigomein"`
	DescripcionMeIn  string `json:"descripcionmein"`
	CantidadMov      int    `json:"cantidadmov"`
	CantidadDevMov   int    `json:"cantidaddevmov"`
	MotivoCargoID    int    `json:"motivocargoid"`
}
