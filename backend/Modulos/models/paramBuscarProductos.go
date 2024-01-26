package models

// ParamBuscarProductos is...
type ParamBuscarProductos struct {
	PiHDGCodigo      int    `json:"hdgcodigo"`
	PiESACodigo      int    `json:"esacodigo"`
	PiCMECodigo      int    `json:"cmecodigo"`
	PMEINID          int    `json:"mein_id"`
	PiCodigo         string `json:"codigo"`
	PiDescripcion    string `json:"descripcion"`
	PiTipoDeProducto string `json:"tipodeproducto"`
	PiPrincActivo    int    `json:"princactivo"`
	PiPresentacion   int    `json:"presentacion"`
	PiFormaFarma     int    `json:"FormaFarma"`
	PiUsuario        string `json:"usuario"`
	PiServidor       string `json:"servidor"`
	URecetaretenida  string `json:"recetaretenida"`
}
