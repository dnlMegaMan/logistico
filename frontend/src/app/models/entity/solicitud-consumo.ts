import { DetalleSolicitudConsumo } from './detalle-solicitud-consumo';

export class SolicitudConsumo {
	accion               : string ; 
	marca                :boolean;
	id                  : number; 
	hdgcodigo            : number; 
	esacodigo            : number; 
	cmecodigo            : number; 
	centrocosto          : number; 
	idpresupuesto        : number; 
	glosa                : string ; 
	fechasolicitud       : string ; 
	fechaenviosolicitud  : string ; 
	referenciacontable   : number; 
	operacioncontable    : number; 
	estado               : number; 
	prioridad            : number; 
	usuariosolicita      : string ; 
	usuarioautoriza      : string ; 
	detsolicitudconsumo  : DetalleSolicitudConsumo[]; 
	usuario              : string ; 
    servidor             : string ; 
    fechadesde           : string ;
	fechahasta           : string ;
	glosacentrocosto     : string;
	glosaestado          : string;
	glosaprioridad       : string;
	errorerp             : string;
}
