package models

/****pais ****/

// ListaPaisEntrada is...
type ListaPaisEntrada struct {
	Servidor string `json:"servidor"`
}

// ListaPaisSalida is...
type ListaPaisSalida struct {
	PaisCodigo      int    `json:"paiscodigo"`
	PaisDescripcion string `json:"paisdescripcion"`
	Mensaje         string `json:"mensaje"`
}

/**** region ****/

type ListaRegionEntrada struct {
	Condicion int    `json:"condicion"`
	Servidor  string `json:"servidor"`
}

// ListaRegionSalida is...
type ListaRegionSalida struct {
	RegionCodigo      int    `json:"regioncodigo"`
	RegionDescripcion string `json:"regiondescripcion"`
	Mensaje           string `json:"mensaje"`
}

/**** ciudad ****/

type ListaCiudadEntrada struct {
	Condicion int    `json:"condicion"`
	Servidor  string `json:"servidor"`
}

// ListaCiudadSalida is...
type ListaCiudadSalida struct {
	CiudadCodigo      int    `json:"ciudadcodigo"`
	CiudadDescripcion string `json:"ciudaddescripcion"`
	Mensaje           string `json:"mensaje"`
}

/**** comuna ****/

type ListaComunaEntrada struct {
	Condicion int    `json:"condicion"`
	Servidor  string `json:"servidor"`
}

// ListaComunaSalida is...
type ListaComunaSalida struct {
	ComunaCodigo      int    `json:"comunacodigo"`
	ComunaDescripcion string `json:"comunadescripcion"`
	Mensaje           string `json:"mensaje"`
}
