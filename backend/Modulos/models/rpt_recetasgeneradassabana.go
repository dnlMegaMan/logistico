package models

// AEntrada is...
type RPT_recetasgeneradassabana struct {
	HDGCODIGO			int    `json:"hdgcodigo"`
	ESACODIGO			int    `json:"esacodigo"`
	CMECODIGO			int    `json:"cmecodigo"`
	SOLIID          	int    `json:"soliid"`
	RECEID				int    `json:"receid"`
	FECHACREACION		string `json:"fechacreacion"`
	FECHADESPACHO   	string `json:"fechadespacho"`
	TIPORECETA			string `json:"tiporeceta"`
	AMBITORECETA		string `json:"ambitoreceta"`
	ESTADORECETA		string `json:"estadoreceta"`
	GLSBODEGA			string `json:"glsbodega"`
	FECHAPAGO			string `json:"fechapago"`
	NROCOMPROBANTEPAGO	string `json:"nrocomprobantepago"`
	USUARIOPAGO			string `json:"usuariopago"`
	FECHARPT			string `json:"fecharpt"`
	USUARIO				string `json:"usuario"`
	CODMEIN				string `json:"codmein"`
	MEINDESCRI			string `json:"meindescri"`
	CANTSOLI			int    `json:"cantsoli"`
	CANTDESP			int    `json:"cantdesp"`
	CANTPEND			int    `json:"cantpend"`
}
