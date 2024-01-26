package models

// UnidadesOrganizacionales is...
type UnidadesOrganizacionales struct {
	ACCION          string               `json:"accion"`
	CORRELATIVO     int                  `json:"correlativo"`
	UNORTYPE        string               `json:"unortype"`
	DESCRIPCION     string               `json:"descripcion"`
	CODIGOFLEXIBLE  string               `json:"codigoflexible"`
	UNORCORRELATIVO int                  `json:"unorcorrelativo"`
	CODIGOSUCURSA   int                  `json:"codigosucursal"`
	CODIGOOFICINA   int                  `json:"codigooficina"`
	RUTFICTICIO     int                  `json:"rutficticio"`
	VIGENTE         string               `json:"vigente"`
	USUARIO         string               `json:"usuario"`
	SERVIDOR        string               `json:"servidor"`
	CentrosCosto    []CentroCostoUsuario `json:"centroscosto"`
	HDGCODIGO       int                  `json:"hdgcodigo,omitempty"`
	ESACODIGO       int                  `json:"esacodigo,omitempty"`
	CMECODIGO       int                  `json:"cmecodigo,omitempty"`
}
