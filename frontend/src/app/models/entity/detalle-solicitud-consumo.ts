export class DetalleSolicitudConsumo {
    accion      			: string;
	iddetalle   			: number;
	id          			: number;
	centrocosto   			: number;
	idpresupuesto 			: number;
	idproducto    			: number;
	codigoproducto 			: string;
	glosaproducto   		: string;
	cantidadsolicitada      : number;
	cantidadrecepcionada    : number;
	referenciacontable      : number;
	operacioncontable       : number;
	estado                  : number;
	prioridad               : number;
	usuariosolicita         : string;
	usuarioautoriza         : string;
	usuario                 : string;
	servidor                : string;
	glosaunidadconsumo      : string;
	marcacheckgrilla		: boolean;
	bloqcampogrilla			: boolean;
}