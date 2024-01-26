package models

// PeriCierreKardexBodega is...
type PeriCierreKardexBodega struct {
	CKarID            int    `json:"ckarid"`
	HDGCodigo         int    `json:"hdgcodigo"`
	CMECodigo         int    `json:"cmecodigo"`
	CodBodega         int    `json:"codbodega"`
	CKarPeriodo       int    `json:"ckarperiodo"`
	CKarFechaApertura string `json:"ckarfechaapertura"`
	CKarFechaCierre   string `json:"ckarfechacierre"`
	CKarUsuario       string `json:"ckarusuario"`
}
