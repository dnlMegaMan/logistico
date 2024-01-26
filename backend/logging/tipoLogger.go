package logging

type TipoLogger int16

const (
	MainLogger TipoLogger = iota
	Fin700Logger
	OrdenCompraLogger
	TokenLogger
	ReiniciaServiciosLogger
	BDConnectionLogger
	TruncadorLogger
)

func (s TipoLogger) String() string {
	switch s {
	case MainLogger:
		return "MainLogger"
	case Fin700Logger:
		return "Fin700Logger"
	case OrdenCompraLogger:
		return "OrdenCompraLogger"
	case TokenLogger:
		return "TokenLogger"
	case ReiniciaServiciosLogger:
		return "ReiniciaServiciosLogger"
	case BDConnectionLogger:
		return "BDConnectionLogger"
	case TruncadorLogger:
		return "TruncadorLogger"
	default:
		return "Logger desconocido"
	}
}
