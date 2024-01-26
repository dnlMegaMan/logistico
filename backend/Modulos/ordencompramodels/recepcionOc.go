package models

// RecepcionOc is...

type RecepcionOc struct {
	Servidor           string                    `json:"servidor"`
	Id                 int                       `json:"id"`
	Provid             int                       `json:"provid"`
	Numerodoc          int                       `json:"numerodoc"`
	Fechaemision       string                    `json:"fechaemision"`
	Fecharecepcion     string                    `json:"fecharecepcion"`
	Fechaactualizacion string                    `json:"fechaactualizacion"`
	Cantitems          int                       `json:"cantidaditems"`
	Cantunidades       int                       `json:"cantidadunidades"`
	Montototal         int                       `json:"monto"`
	Tipodoc            int                       `json:"tipo"`
	BodCodigo          int                       `json:"bodcodigo"`
	DetalleMov         []RecepcionOrdenCompraDet `json:"detallemov"`
}

type RecepcionOrdenCompraDet struct {
	Odmoid               int    `json:"odmoid"`
	OdmoFecha            string `json:"odmofecha"`
	OdmoFechaVencimiento string `json:"odmofechavencimiento"`
	OdmoMonto            int    `json:"odmomonto"`
	OdmoResponsable      string `json:"odmoresponsable"`
	Odmoguiaid           int    `json:"odmoguiaid"`
	Odmoorcoid           int    `json:"odmoorcoid"`
	Odmoodetid           int    `json:"odmoodetid"`
	Odmocantidad         int    `json:"odmocantidad"`
	Odmocantdevuelta     int    `json:"odmocantdevuelta"`
	//dato del lote
	HDGCodigo int    `json:"hdgcodigo"`
	ESACodigo int    `json:"esacodigo"`
	CMECodigo int    `json:"cmecodigo"`
	Lote      string `json:"lote"`
	MeinId    int    `json:"meinid"`
}

type LoteOc struct {
	HDGCodigo        int    `json:"hdgcodigo"`
	ESACodigo        int    `json:"esacodigo"`
	CMECodigo        int    `json:"cmecodigo"`
	BodId            int    `json:"bodid"`
	MeinId           int    `json:"meinid"`
	Lote             string `json:"lote"`
	FechaVencimiento string `json:"fechavencimiento"`
	Saldo            int    `json:"saldo"`
	ProvId           int    `json:"provid"`
	OdetId           int    `json:"odetid"`
}

type RetornaIdRecep struct {
	Odmoid int `json:"odmoid"`
}
