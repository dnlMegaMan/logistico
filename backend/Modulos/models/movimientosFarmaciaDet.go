package models

// MovimientosFarmaciaDet is...
type MovimientosFarmaciaDet struct {
	MovimFarDetID          int                           `json:"movimfardetid"`
	MovimFarID             int                           `json:"movimfarid"`
	FechaMovimDet          string                        `json:"fechamovimdet"`
	MovTipo                int                           `json:"tipomov"`
	CodigoMein             string                        `json:"codigomein"`
	MeInID                 int                           `json:"meinid"`
	CantidadMov            int                           `json:"cantidadmov"`
	ValorCostoUni          float64                       `json:"valorcostouni"`
	ValorVentaUni          float64                       `json:"valorventaUni"`
	UnidadDeCompra         int                           `json:"unidaddecompra"`
	ContenidoUniDeCom      int                           `json:"contenidounidecom"`
	UnidadDeDespacho       int                           `json:"unidaddedespacho"`
	CantidadDevol          int                           `json:"cantidaddevol"`
	CuentaCargoID          int                           `json:"cuentacargoid"`
	NumeroReposicion       int                           `json:"numeroreposicion"`
	IncobrableFonasa       string                        `json:"incobrablefonasa"`
	DescripcionMeIn        string                        `json:"descripcionmein"`
	Lote                   string                        `json:"lote"`
	FechaVto               string                        `json:"fechavto"`
	IDMotivo               int                           `json:"idtipomotivo"`
	PiCantidadAdevolver    int                           `json:"cantidadadevolver"`
	PiCantidadArecepcionar int                           `json:"cantidadarecepcionar"`
	TipoMotivoDes          string                        `json:"tipomotivodes"`
	DetalleDevol           []MovimientosFarmaciaDetDevol `json:"movimientosfarmaciadetdevol"`
}
