package models

type MedicamentoCheckRequest struct {
	ProductoStock      int    `json:"productoStock"`
	Vigente            int    `json:"vigente"`
	ConsumoRestringido int    `json:"consumoRestringido"`
	RepoAuto           int    `json:"repoAuto"`
	FechaVenc          int    `json:"fechaVenc"`
	Magistral          int    `json:"magistral"`
	ValorVar           int    `json:"valorVar"`
	Pos                int    `json:"pos"`
	Poss               int    `json:"poss"`
	ConsumoGeneral     int    `json:"consumoGeneral"`
	PrecioRegulado     int    `json:"precioRegulado"`
	Acondicionamiento  int    `json:"acondicionamiento"`
	Adecuado           int    `json:"adecuado"`
	ArtInsEspecial     int    `json:"artInsEspecial"`
	CodMein            string `json:"codMein"`

	Usuario  string `json:"usuario"`
	Servidor string `json:"servidor"`
	// "I" para insertar, "M" para modificar uno existente
	Accion string `json:"accion"`
}
