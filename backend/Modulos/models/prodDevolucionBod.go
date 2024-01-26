package models

// ProdDevolucionBod is...
type ProdDevolucionBod struct {
	SoliID                  int    `json:"soliid"`
	SodeID                  int    `json:"sodeid"`
	MovfID                  int    `json:"movfid"`
	MDevID                  int    `json:"mdevid"`
	FechaDevolucion         string `json:"fechadevolucion"`
	Lote                    string `json:"lote"`
	FechaVto                string `json:"fechavto"`
	CantDevuelta            int    `json:"cantdevuelta"`
	CantRecepDevol          int    `json:"cantrecepdevol"`
	CantPendienteRecepDevol int    `json:"cantpendienterecepdevol"`
	MeInID                  int    `json:"meinid"`
	CodMei                  string `json:"codmei"`
	MeInDescri              string `json:"meindescri"`
	CantSoli                int    `json:"cantsoli"`
	CantDespachada          int    `json:"cantdespachada"`
	CantDevolucion          int    `json:"cantdevolucion"`
	CantRecepcionado        int    `json:"cantrecepcionado"`
	SODECANTRECEPDEVO       int    `json:"sodecantrecepdevo"`
}
