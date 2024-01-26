package models

// MoviminetoInterfaz is...
type MoviminetoInterfaz struct {
	MOVID                  int    `json:"movid"`
	DETID                  int    `json:"detid"`
	DEVID                  int    `json:"devid"`
	HDGCODIGO              int    `json:"hdgcodigo"`
	ESACODIGO              int    `json:"esacodigo"`
	CMECODIGO              int    `json:"cmecodigo"`
	FECHAINCIO             string `json:"fechainicio"`
	FECHATERMINO           string `json:"fechatermino"`
	SERVICIO               string `json:"servicio"`
	SERVIDOR               string `json:"servidor"`
	USUARIO                string `json:"usuario"`
	FDEID                  int    `json:"fdeid"`
	SOLIID                 int    `json:"soliid"`
	IDAGRUPADOR            int    `json:"idagrupador"`
	FECHA                  string `json:"fecha"`
	TIPOMOVIMIENTOCUENTA   string `json:"tipomovimientocuenta"`
	CODTIPMOV              int    `json:"codtipmov"`
	TIPOMOVIMIENTO         string `json:"tipomovimiento"`
	IDENTIFICACION         string `json:"identificacion"`
	PACIENTE               string `json:"paciente"`
	MFDEMEINCODMEI         string `json:"mfdemeincodmei"`
	MFDEMEINID             int    `json:"mfdemeinid"`
	MFDECANTIDAD           int    `json:"mfdecantidad"`
	MFDECTASID             int    `json:"mfdectasid"`
	MFDEREFERENCIACONTABLE int    `json:"mfdereferenciacontable"`
	INTCARGOESTADO         string `json:"intcargoestado"`
	INTCARGOFECHA          string `json:"intcargofecha"`
	INTCARGOERROR          string `json:"intcargoerror"`
	INTERPESTADO           string `json:"interpestado"`
	INTERPFECHA            string `json:"interpfecha"`
	INTERPERROR            string `json:"interperror"`
	DESCRIPCIONPRODUCTO    string `json:"descripcionproducto"`
	CAMAACTUAL             string `json:"camaactual"`
	CODAMBITO              int    `json:"codambito"`
	CTANUMCUENTA           int    `json:"ctanumcuenta,string"`
	ESTADOENVIO            string `json:"estadoenvio"`
	GLOSARESPUESTA         string `json:"glosarespuesta"`
	NUMERORECETA           int    `json:"numeroreceta"`
	MARCA                  bool   `json:"marca"`
}
