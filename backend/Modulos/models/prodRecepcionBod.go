package models

// ProdRecepcionBod is...
type ProdRecepcionBod struct {
	SoliID                int    `json:"soliid"`
	SodeID                int    `json:"sodeid"`
	MfDeID                int    `json:"mfdeid"`
	FechaRecepcion        string `json:"fecharecepcion"`
	Lote                  string `json:"lote"`
	FechaVto              string `json:"fechavto"`
	CantRecepcionada      int    `json:"cantrecepcionada"`
	CantDevuelta          int    `json:"cantdevuelta"`
	CantPendienteDevolver int    `json:"cantpendientedevolver"`
	MeInID                int    `json:"meinid"`
	CodMei                string `json:"codmei"`
	MeInDescri            string `json:"meindescri"`
	CantSoli              int    `json:"cantsoli"`
	CantDespachada        int    `json:"cantdespachada"`
}
