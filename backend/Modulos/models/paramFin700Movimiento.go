package models

import "database/sql"

// ParamFin700Movimiento is...
type ParamFin700Movimiento struct {
	HdgCodigo        int     `json:"hdgcodigo"`
	EsaCodigo        int     `json:"esacodigo"`
	CmeCodigo        int     `json:"cmecodigo"`
	Servidor         string  `json:"servidor"`
	Usuario          string  `json:"usuario"`
	TipoMovimiento   int     `json:"tipomovimiento"`
	SoliID           int     `json:"soliid"`
	ReceID           int     `json:"receid"`
	NumeroMovimiento int     `json:"numeromovimiento"`
	ReferenciaDesp   int     `json:"referenciadesp"`
	IDAgrupador      int     `json:"idagrupador"`
	SobreGiro        bool    `json:"sobregiro"`
	Contador         int     `json:"contador"`
	CodAmbito        int     `json:"codambito"`
	MovfID           int     `json:"movfid"`
	URL              string  `json:"url"`
	IntegraFin700    string  `json:"integrafin700"`
	IntegraSisalud   string  `json:"integrasisalud"`
	IntegraLegado    string  `json:"integralegado"`
	DB               *sql.DB `json:"DB"`
}
