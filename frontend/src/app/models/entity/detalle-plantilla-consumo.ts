export class DetallePlantillaConsumo {
  accion      : string;
	iddetalle   : number;
	id          : number;
	centrocosto   : number;
	idpresupuesto : number;
	idproducto    : number;
	codigoproducto : string;
	glosaproducto   : string;
	cantidadsolicitada      : number;
	referenciacontable      : number;
	operacioncontable       : number;
	estado                  : number;
	usuario                 : string;
	servidor                : string;
	glosaunidadconsumo      : string;
	marcacheckgrilla		: boolean;
	bloqcampogrilla			: boolean;
  excedecant: boolean;
  meindescri: string;
  descunidadmedida: string;
  constructor(
    excedecant?: boolean) {
      this.excedecant = false;
  }
}
