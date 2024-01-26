package models

// ParamPorDescripcion is...
type ParamPorDescripcion struct {
	PiHDGCodigo          int                `json:"hdgcodigo"`
	PiESACodigo          int                `json:"esacodigo"`
	PiCMECodigo          int                `json:"cmecodigo"`
	PiCodigo             string             `json:"codigo"`
	PiDescripcion        string             `json:"descripcion"`
	PiTipoDeProducto     string             `json:"tipodeproducto"`
	PiPrincActivo        int                `json:"princactivo"`
	PiPresentacion       int                `json:"presentacion"`
	PiFormaFarma         int                `json:"formafarma"`
	PiUsuario            string             `json:"usuario"`
	IDBodega             int                `json:"idbodega"`
	ControlMinimo        string             `json:"controlminimo"`
	Controlado           string             `json:"controlado"`
	Consignacion         string             `json:"consignacion"`
	PiServidor           string             `json:"servidor"`
	CLINUMIDENTIFICACION string             `json:"clinumidentificacion"`
	PiProveedor          int                `json:"proveedor"`
	PiTipoDoc            int                `json:"tipodoc"`
	PiNumdoc             int                `json:"numdoc"`
	PiPantalla           string             `json:"pantalla"`
	CUM                  int                `json:"cum"`
	BodegaProductos      []ProductosBodegas `json:"bodegaproductos"`
}
