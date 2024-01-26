package models

// ParamDetRecepDevolBodega is...
type ParamDetRecepDevolBodega struct {
	PiSodeID                int    `json:"sodeid"`
	PiMovfID                int    `json:"movfid"`
	PiMfDeID                int    `json:"mfdeid"`
	PiFechaRecepcion        string `json:"fecharecepcion"`
	PiLote                  string `json:"lote"`
	PiFechaVto              string `json:"fechavto"`
	PiCantRecepcionada      int    `json:"cantrecepcionada"`
	PiCantDevuelta          int    `json:"cantdevuelta"`
	PiCodMei                string `json:"codmei"`
	PiMeInDescri            string `json:"meindescri"`
	PiCantSoli              int    `json:"cantsoli"`
	PiCantDespachada        int    `json:"cantdespachada"`
	PiCantDevolucion        int    `json:"cantdevolucion"`
	PiCantRecepcionado      int    `json:"cantrecepcionado"`
	PiCantDevolARecepcionar int    `json:"cantdevolarecepcionar"`
	PiMeInID                int    `json:"meinid"`
	PiMDevID                int    `json:"mdevid"`
}
