package models

// FiltroDetallePlantillaBodega is...
type FiltroDetallePlantillaBodega struct{
	Pldeid            int 		`json:"pldeid"`
	Planid            int 		`json:"planid"`
	Codmei            string 	`json:"codmei"`
	Meindescri        string 	`json:"meindescri"`
	Meinid            int 		`json:"meinid"`
	Cantsoli          int 		`json:"cantsoli"`
	Pldevigente       string 	`json:"pldevigente"`
	Fechacreacion     string 	`json:"fechacreacion"`
	Usuariocreacion   string 	`json:"usuariocreacion"`
	Usuariomodifica   string 	`json:"usuariomodifica"`
	Fechamodifica     string 	`json:"fechamodifica"`
	Usuarioelimina    string 	`json:"usuarioelimina"`
	Fechaelimina      string 	`json:"fechaelimina"`
	Acciond           string 	`json:"acciond"`
	Tiporegmein       string 	`json:"tiporegmein"`
	Excedecant        bool 		`json:"excedecant"`
	Marcacheckgrilla  bool 		`json:"marcacheckgrilla"`
	Bloqcampogrilla   bool 		`json:"bloqcampogrilla"`
	Cantsoliresp      int		`json:"cantsoliresp"`
}