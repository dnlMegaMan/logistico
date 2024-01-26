package models

// SelCierreLibroMedControlados is...
type SelCierreLibroMedControlados struct {
	LIBCID               int    `json:"libcid"`
	CORRELATIVO          int    `json:"correlativo"`
	CODBODEGACONTROLADOS int    `json:"codbodegacontrolados"`
	MEINID               int    `json:"meinid"`
	MEINCODMEI           string `json:"meincodmei"`
	MEINDESCRI           string `json:"meindescri"`
	MOVIMFECHA           string `json:"movimfecha"`
	MOVIMDESCRI          string `json:"movimdescri"`
	TIPOMOTIVODES        string `json:"tipomotivodes"`
	FBOBDESCRI           string `json:"fbobdescri"`
	NRORECETA            int    `json:"nroreceta"`
	NROSOLICITUD         int    `json:"nrosolicitud"`
	RUTPROF              string `json:"rutprof"`
	NOMBREPROF           string `json:"nombreprof"`
	RUTPACIENTE          string `json:"rutpaciente"`
	NOMBREPACIENTE       string `json:"nombrepaciente"`
	CANTIDADENTRADA      int    `json:"cantidadentrada"`
	CANTIDADSALIDA       int    `json:"cantidadsalida"`
	CANTIDADSALDO        int    `json:"cantidadsaldo"`
	REFERENCIA           int    `json:"referencia"`
}
