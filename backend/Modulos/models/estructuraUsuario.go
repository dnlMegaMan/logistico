package models

// EstructuraUsuarios is...
type EstructuraUsuarios struct {
	HDGCodigo     int                       `json:"hdgcodigo"`
	CMECodigo     int                       `json:"cmecodigo"`
	UserName      string                    `json:"username"`
	UserCode      string                    `json:"usercode"`
	UserRut       string                    `json:"userrut"`
	USerID        int                       `json:"userid"`
	Servidor      string                    `json:"servidor"`
	Usuario       string                    `json:"usuario"`
	ListaUsuarios []EstructuralistaUsuarios `json:"listausuarios"`
}
