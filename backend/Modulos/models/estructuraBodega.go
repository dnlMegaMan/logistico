package models

// EstructuraBodega is...
type EstructuraBodega struct {
	Accion            string                            `json:"accion"`
	HDGCodigo         int                               `json:"hdgcodigo"`
	ESACodigo         int                               `json:"esacodigo"`
	CMECodigo         int                               `json:"cmecodigo"`
	CodBodega         int                               `json:"codbodega"`
	DesBodega         string                            `json:"desbodega"`
	FbodEstado        string                            `json:"estado"`
	DespachaReceta    string                            `json:"despachareceta"`
	FbodModificable   string                            `json:"modificable"`
	FbodTipoPorducto  string                            `json:"tipoproducto"`
	FbodTipoBodega    string                            `json:"tipobodega"`
	FbodFraccionable  string                            `json:"fbodfraccionable"`
	GlosaTipoBodega   string                            `json:"glosatipobodega"`
	GlosaTipoProducto string                            `json:"glosatiproducto"`
	FboCodigoBodega   string                            `json:"fbocodigobodega"`
	Servidor          string                            `json:"servidor"`
	Usuario           string                            `json:"usuario"`
	Servicios         []EstructuraServicioUnidadBodegas `json:"serviciosunidadbodega"`
	Productos         []EstructuraProductosBodegas      `json:"productosbodega"`
	Usuarios          []EstructuraUsuariosBodegas       `json:"usuariosbodega"`
	RelacionBodegas   []EstructuraRelacionBodega        `json:"relacionbodegas"`
	ProductosDemanda  []EstructuraProductosDemanda      `json:"productosdemanda"`
}
