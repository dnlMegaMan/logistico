package models

// WsConsultaSaldoParam is...
type WsConsultaSaldoParam struct {
	Empresa 		int	   `json:"esacodigo"` 
	Division 		int	   `json:"hdgcodigo"` 
	Bodega 			int	   `json:"codbodega"` 
	Producto 		string `json:"codmei"` 
	Servidor 		string `json:"servidor"`
}
