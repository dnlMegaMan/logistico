package models

// ParamGrabaDevolucionOC is...
type ParamGrabaDevolucionOC struct {
	OcCantaDevol  int    `json:"occantadevol"`
	Responsable   string `json:"responsable"`
	OcDetMovID    int    `json:"ocdetmovid"`
	OcDetMovDetID int    `json:"ocdetmovdetid"`
	OcDetMeInID   int    `json:"ocdetmeinid"`
	OcDetMfDeID   int    `json:"ocdetmfdeid"`
	OcHdgCodigo   int    `json:"ochdgcodigo"`
	OcEsaCodigo   int    `json:"ocesacodigo"`
	OcCmeCodigo   int    `json:"occmecodigo"`
	OcDetnroDocto int    `json:"ocdetnrodocto"`
	PiUsuario     string `json:"usuario"`
	PiServidor    string `json:"servidor"`
}
