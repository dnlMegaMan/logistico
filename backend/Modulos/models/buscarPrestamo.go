package models

import "errors"

type BuscarPrestamo struct {
	Id        int    `json:"id"`
	IdOrigen  int    `json:"idOrigen"`
	IdDestino int    `json:"idDestino"`
	FechaDes  string `json:"fechaDes"`
	FechaHas  string `json:"fechaHas"`
	Estado    string `json:"estado"`
	Usuario   string `json:"usuario"`
	Servidor  string `json:"servidor"`
	HDGCodigo int    `json:"hdgcodigo"`
	ESACodigo int    `json:"esacodigo"`
	CMECodigo int    `json:"cmecodigo"`
}

func (ecb *BuscarPrestamo) Validate() error {
	if ecb.Servidor == "" {
		return errors.New("error: Servidor es obligatorio")
	}
	if ecb.HDGCodigo == 0 {
		return errors.New("error: HDGCodigo es obligatorio")
	}
	if ecb.ESACodigo == 0 {
		return errors.New("error: ESACodigo es obligatorio")
	}
	if ecb.CMECodigo == 0 {
		return errors.New("error: CMECodigo es obligatorio")
	}
	return nil
}

// GetUsuario es un metodo en tu interfaz Validator para obtener el usuario.
func (ecb *BuscarPrestamo) GetUsuario() string {
	return ecb.Usuario
}

type Prestamo struct {
	IdOrigen      int    `json:"idOrigen"`
	IdDestino     int    `json:"idDestino"`
	Origen        string `json:"origen"`
	Destino       string `json:"destino"`
	FechaPrestamo string `json:"fecha_prestamo"`
	ID            int    `json:"id"`
	Observaciones string `json:"observaciones"`
	Servidor      string `json:"servidor"`
	Usuario       string `json:"usuario"`
	EstadoID      int    `json:"estadoID"`
	EstadoDes     string `json:"estadoDes"`
	TipoMov       string `json:"tipoMov"`
	Hdgcodigo     int    `json:"hdgcodigo"`
	Esacodigo     int    `json:"esacodigo"`
	Cmecodigo     int    `json:"cmecodigo"`
	Responsable   string `json:"responsable"`
}

func (ecb *Prestamo) Validate() error {
	if ecb.Servidor == "" {
		return errors.New("error: Servidor es obligatorio")
	}
	if ecb.Hdgcodigo == 0 {
		return errors.New("error: HDGCodigo es obligatorio")
	}
	if ecb.Esacodigo == 0 {
		return errors.New("error: ESACodigo es obligatorio")
	}
	if ecb.Cmecodigo == 0 {
		return errors.New("error: CMECodigo es obligatorio")
	}
	return nil
}

// GetUsuario es un metodo en tu interfaz Validator para obtener el usuario.
func (ecb *Prestamo) GetUsuario() string {
	return ecb.Usuario
}

type PrestamoDet struct {
	ID             int    `json:"id"`
	FpreID         int    `json:"fpre_id"`
	Codmei         string `json:"codmei"`
	Observacion    string `json:"descripcion"`
	MeinID         int    `json:"mein_id"`
	CantSolicitada int    `json:"cant_solicitada"`
	CantDevuelta   int    `json:"cant_devuelta"`
	CodigoCum      string `json:"codigo_cum"`
	RegistroInvima string `json:"registro_invima"`
	Lote           string `json:"lote"`
	FechaVto       string `json:"fecha_vto"`
	UpdateDet      bool   `json:"update"`
	CreateDet      bool   `json:"create"`
}

type PrestamoMov struct {
	ID             int    `json:"id"`
	FpreID         int    `json:"fpre_id"`
	MeinID         int    `json:"mein_id"`
	Fecha          string `json:"fecha"`
	Cantidad       int    `json:"cantidad"`
	Responsable    string `json:"responsable"`
	CodigoCum      string `json:"codigo_cum"`
	RegistroInvima string `json:"registro_invima"`
	Lote           string `json:"lote"`
	FechaVto       string `json:"fecha_vto"`
}

type RespuestaPrestamo struct {
	Servidor    string        `json:"servidor"`
	Prestamo    []Prestamo    `json:"prestamo"`
	PrestamoDet []PrestamoDet `json:"prestamo_det"`
	PrestamoMov []PrestamoMov `json:"prestamo_mov"`
}

type RespuestaForzarCierre struct {
	Servidor      string `json:"servidor"`
	ID            int    `json:"id"`
	Usuario       string `json:"usuario"`
	Observaciones string `json:"observaciones"`
}
