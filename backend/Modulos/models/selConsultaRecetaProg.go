package models

// SelConsultaRecetaProg is...
type SelConsultaRecetaProg struct {
	SoliID              int                 `json:"soliid"`
	FechaCreacion       string              `json:"fechacreacion"`
	BodegaDesc          string              `json:"bodegadesc"`
	NumeroReceta        float64             `json:"numeroreceta"`
	TipoDocDescPaciente string              `json:"tipodocdescpaciente"`
	NumDocPaciente      string              `json:"numdocpaciente"`
	NombrePaciente      string              `json:"nombrepaciente"`
	EdadPac             string              `json:"edadpaciente"`
	TipoDocDescProf     string              `json:"tipodocdescprof"`
	NumDocProf          string              `json:"numdocprof"`
	NombreProf          string              `json:"nombreprof"`
	SoliCodAmbito       int                 `json:"solicodambito"`
	DetalleRecetaProg   []DetalleRecetaProg `json:"detallerecetaprog"`
}
