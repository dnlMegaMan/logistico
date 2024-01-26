package models

type ClinfarParam struct {
	ID          int    `json:"id"`
	Tipo        int    `json:"tipo"`
	Codigo      int    `json:"codigo"`
	Descripcion string `json:"descripcion"`
	Valor       string `json:"valor"`
	Servidor    string `json:"servidor"`
	HDGCodigo   int    `json:"hdgcodigo"`
	ESACodigo   int    `json:"esacodigo"`
	CMECodigo   int    `json:"cmecodigo"`
}

type ConsularParamInitPrestamos struct {
	ConsultaListBodegas     []ClinfarParam `json:"consulta_list_bodegas"`
	ConsultaListExternas    []ClinfarParam `json:"consulta_list_externas"`
	ConsultaListProductos   []ClinfarParam `json:"consulta_list_productos"`
	ConsultaListMovimientos []ClinfarParam `json:"consultar_tipo_movimientos"`
	ConsultaListPrestamos   []ClinfarParam `json:"consultar_tipo_prestamos"`
	IngresoVencimiento      int            `json:"ingreso_vencimiento"`
}
