package models

// OrdenCompra is...
type OrdenCompra struct {
	OrcoId               int              `json:"orcoid"`
	OrcoProv             int              `json:"orcoprov"`
	OrcoUser             string           `json:"orcouser"`
	OrcoEstado           int              `json:"orcoestado"`
	OrcoFechaCierre      string           `json:"orcofechacierre"`
	OrcoFechaAnulacion   string           `json:"orcofechaanulacion"`
	OrcoBodId            int              `json:"orcobodid"`
	OrcoFechaEmision     string           `json:"orcofechaemision"`
	OrcoCondicionDePago  int              `json:"orcocondiciondepago"`
	Servidor             string           `json:"servidor"`
	Orcobandera          int              `json:"orcobandera"`
	Orconumdoc           int              `json:"orconumdoc"`
	Orcofechadoc         string           `json:"orcofechadoc"`
	ListaMein            string           `json:"listamein"`
	ModificacionCabecera int              `json:"modificacioncabecera"`
	ModificacionDetalle  int              `json:"modificaciondetalle"`
	Detalle              []OrdenCompraDet `json:"orcodetalle"`
}

// OrdenCompraDet is...
type OrdenCompraDet struct {
	OdetId             int    `json:"odetid"`
	OrcoId             int    `json:"orcoid"`
	OdetMeinId         int    `json:"odetmeinid"`
	OdetEstado         int    `json:"odetestado"`
	OdetCantReal       int    `json:"odetcantreal"`
	OdetCantDespachada int    `json:"odetcantdespachada"`
	OdetCantDevuelta   int    `json:"odetcantdevuelta"`
	OdetFechaAnula     string `json:"odetfechaanula"`
	OdetFechaCreacion  string `json:"odetfechacreacion"`
	OdetCantCalculada  int    `json:"odetcantcalculada"`
	OdetValorCosto     int    `json:"odetvalorcosto"`
}

type RetornaIdOc struct {
	OrcoId    int `json:"orcoid"`
	OrcoBodId int `json:"orcobodid"`
}

type RevertirOc struct {
	PiHDGCodigo int    `json:"hdgcodigo"`
	PiESACodigo int    `json:"esacodigo"`
	PiCMECodigo int    `json:"cmecodigo"`
	OrcoId      int    `json:"orcoid"`
	OrcoProv    int    `json:"orcoprov"`
	OrcoUser    string `json:"orcouser"`
	Servidor    string `json:"servidor"`
}

type ListarMeinBodegaSalida struct {
	Mensaje  string `json:"mensaje"`
	MeinCod  string `json:"meincod"`
	MeinDesc string `json:"meindesc"`
}

type ListarMeinBodegaEntrada struct {
	Servidor    string           `json:"servidor"`
	IdBodega    int              `json:"idbodega"`
	PiHDGCodigo int              `json:"hdgcodigo"`
	PiESACodigo int              `json:"esacodigo"`
	PiCMECodigo int              `json:"cmecodigo"`
	Detalle     []OrdenCompraDet `json:"detalleoc"`
}
