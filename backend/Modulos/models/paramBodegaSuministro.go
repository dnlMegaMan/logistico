package models

// ParamBodegaSuministro is...
type ParamBodegaSuministro struct {
	PiHDGCodigo         int    `json:"hdgcodigo"`
	PiESACodigo         int    `json:"esacodigo"`
	PiCMECodigo         int    `json:"cmecodigo"`
	PiUsuario           string `json:"usuario"`
	PiServidor          string `json:"servidor"`
	PiBodCodigoSolicita int    `json:"bodcodigosolicita"`
	PiTipoRegOri        int    `json:"tiporegori"`
}
