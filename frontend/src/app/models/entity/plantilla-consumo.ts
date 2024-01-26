import { DetallePlantillaConsumo } from './detalle-plantilla-consumo';

export class PlantillaConsumo {
    accion               : string ; 
	id                  : number; 
	hdgcodigo            : number; 
	esacodigo            : number; 
	cmecodigo            : number; 
	centrocosto          : number; 
	idpresupuesto        : number; 
	glosa                : string ; 
	referenciacontable   : number; 
	operacioncontable    : number; 
	estado               : number; 
	detplantillaconsumo  : DetallePlantillaConsumo[]; 
	usuario              : string ; 
    servidor             : string ; 
    fechadesde           : string ;
	fechahasta           : string ;
	glosacentrocosto     : string;
	glosaestado          : string;
}
