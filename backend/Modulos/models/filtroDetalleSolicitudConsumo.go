package models

// FiltroDetalleSolicitudConsumo is...
type FiltroDetalleSolicitudConsumo struct{
    Accion      			string  	`json:"accion"`
	Iddetalle   			int  		`json:"iddetalle"`
	ID          			int  		`json:"id"`
	Centrocosto   			int  		`json:"centrocosto"`
	Idpresupuesto 			int  		`json:"idpresupuesto"`
	Idproducto    			int  		`json:"idproducto"`
	Codigoproducto 			string  	`json:"codigoproducto"`
	Glosaproducto   		string  	`json:"glosaproducto"`
	Cantidadsolicitada      int  		`json:"cantidadsolicitada"`
	Cantidadrecepcionada    int  		`json:"cantidadrecepcionada"`
	Referenciacontable      int  		`json:"referenciacontable"`
	Operacioncontable       int  		`json:"operacioncontable"`
	Estado                  int  		`json:"estado"`
	Prioridad               int  		`json:"prioridad"`
	Usuariosolicita         string  	`json:"usuariosolicita"`
	Usuarioautoriza         string  	`json:"usuarioautoriza"`
	Usuario                 string  	`json:"usuario"`
	Servidor                string  	`json:"servidor"`
	Glosaunidadconsumo      string  	`json:"glosaunidadconsumo"`
	Marcacheckgrilla		bool  	`json:"marcacheckgrilla"`
	Bloqcampogrilla			bool  	`json:"bloqcampogrilla"`
}
