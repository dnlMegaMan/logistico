package models

// GrabaDatosMovim is...
type GrabaDatosMovim struct {
	MovTipo          int     `json:"tipomov"`
	MovimFecha       string  `json:"movimfecha"`
	MovimUsuario     string  `json:"movimusuario"`
	BodegaOrigenDes  int     `json:"bodegaorigendes"`
	BodegaDestinoDes int     `json:"bodegadestinodes"`
	EstID            int     `json:"estid"`
	ProveedorID      int     `json:"proveedorid"`
	NumeroGuia       int     `json:"numeroguia"`
	FechaDocumento   string  `json:"fechadocumento"`
	GuiaTipoDcto     int     `json:"guiatipodcto"`
	Receta           int     `json:"numeroreceta"`
	CantidadMov      int     `json:"cantidadmov"`
	ValorTotalMov    float64 `json:"valortotalmov"`
	CliID            int     `json:"cliid"`
	ServicioCargoID  int     `json:"serviciocargoid"`
	NumBoleta        int     `json:"numeroboletacaja"`
	PacAmbulatorio   string  `json:"pacambulatorio"`
	MotivoCargoID    int     `json:"motivocargoid"`
	PiUsuario        string  `json:"usuario"`
	PiServidor       string  `json:"servidor"`
	PiHDGCodigo      int     `json:"hdgcodigo"`
	PiESACodigo      int     `json:"esacodigo"`
	PiCMECodigo      int     `json:"cmecodigo"`
}
