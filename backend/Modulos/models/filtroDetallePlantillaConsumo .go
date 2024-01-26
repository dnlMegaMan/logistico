package models

// FiltroDetallePlantillaConsumo is...
type FiltroDetallePlantillaConsumo struct{
	Accion      		string  `json:"accion"`
	Iddetalle   		int  	`json:"iddetalle"`
	ID          		int  	`json:"id"`
	Centrocosto   		int  	`json:"centrocosto"`
	Idpresupuesto 		int  	`json:"idpresupuesto"`
	Idproducto    		int  	`json:"idproducto"`
	Codigoproducto 		string  `json:"codigoproducto"`
	Glosaproducto   	string  `json:"glosaproducto"`
	Cantidadsolicitada  	int  	`json:"cantidadsolicitada"`
	Referenciacontable  	int  	`json:"referenciacontable"`
	Operacioncontable   	int  	`json:"operacioncontable"`
	Estado              	int  	`json:"estado"`
	Usuario             	string  `json:"usuario"`
	Servidor            	string  `json:"servidor"`
	Glosaunidadconsumo  	string  `json:"glosaunidadconsumo"`
	Marcacheckgrilla	bool  	`json:"marcacheckgrilla"`
	Bloqcampogrilla		bool  	`json:"bloqcampogrilla"`
	Excedecant 		bool  	`json:"excedecant"`
}