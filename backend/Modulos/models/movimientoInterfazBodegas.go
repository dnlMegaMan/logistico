package models

// MovimientoInterfazBodegas is...
type MovimientoInterfazBodegas struct {
	ID                  int    `json:"id"`
	SOLIID	     	    int    `json:"soliid"`
	FECHA               string `json:"fecha"`
	TIPO                string `json:"tipo"`
	CODTIPMOV           int    `json:"codtipmov"`
	TIPOMOVIMIENTO      string `json:"tipomovimiento"`
	BODEGAORIGEN        string `json:"bodegaorigen"`
	BODEGADESTINO       string `json:"bodegadestino"`
	CODIGOARTICULO      string `json:"codigoarticulo"`
	CANTIDAD            int    `json:"cantidad"`
	REFERENCIACONTABLE  int    `json:"referenciacontable"`
	INTCARGOESTADO      string `json:"intcargoestado"`
	INTCARGOFECHA       string `json:"intcargofecha"`
	INTCARGOERROR       string `json:"intcargoerror"`
	INTERPESTADO        string `json:"interpestado"`
	INTERPFECHA         string `json:"interpfecha"`
	INTERPERROR         string `json:"interperror"`
	DESCRIPCIONPRODUCTO string `json:"descripcionproducto"`
	HDGCODIGO           int    `json:"hdgcodigo"`
	ESACODIGO           int    `json:"esacodigo"`
	CMECODIGO           int    `json:"cmecodigo"`
	FECHAINCIO          string `json:"fechainicio"`
	FECHATERMINO        string `json:"fechatermino"`
	SERVICIO            string `json:"servicio"`
	SERVIDOR            string `json:"servidor"`
	USUARIO             string `json:"usuario"`
	MARCA               bool   `json:"marca"`
	AGRUPADOR           int   `json:"agrupador"`
}
