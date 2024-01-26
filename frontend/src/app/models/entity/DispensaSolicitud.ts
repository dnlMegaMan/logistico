import  { DetalleSolicitud } from './DetalleSolicitud';


export class DispensaSolicitud{
    constructor (
        
        public soliid           ?: number,
        public tipoprod         ?: string,
        public estadosolcod     ?: number,
        public estadosolval     ?: string,
        public fechorsolicitud  ?: string,
        public PrioridadCod     ?: number,
        public PrioridadDes     ?: string,
        public pacientesol      ?: string,
        public serviciooricod   ?: number,
        public servicioorides   ?: string,
        public serviciodesdes   ?: string,
        public serviciodescod   ?: number,
        public pacientetipodoc  ?: string,
        public pacienterut      ?: string,
        public pacienteppn      ?: number,
        public pacientectacte   ?: number,
        public pacienteestadia  ?: number,
        public pacienteedad     ?: number,
        public pacientetipoedad ?: string,
        public pacientecodsexo  ?: number,
        public pacientedessexo  ?: string,
        public pacienteconvenio ?: string,
        public estadiaestdiag   ?: string,
        public ambitosolcod     ?: number,
        public ambitosoldes     ?: string,
        public medicotratante   ?: string,
        public clienteid        ?: number,
        public ctacteid         ?: number,
        public campo            ?: string,
        public solicitudesdet   ?: DetalleSolicitud[],    
    ) {}
}