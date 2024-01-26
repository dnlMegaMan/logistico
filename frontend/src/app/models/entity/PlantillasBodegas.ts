import { DetallePlantillaBodega } from './DetallePlantillaBodega';

export class Plantillas {
    constructor(
        public planid               ?: number,
        public plandescrip          ?: string,
        public hdgcodigo            ?: number,
        public esacodigo            ?: number,
        public cmecodigo            ?: number,
        public bodorigen            ?: number,
        public boddestino           ?: number,
        public planvigente          ?: string,
        public fechacreacion        ?: string,
        public usuariocreacion      ?: string,
        public fechamodifica        ?: string,
        public usuariomodifica      ?: string,
        public fechaelimina         ?: string,
        public usuarioelimina       ?: string,
        public bodorigendesc        ?: string,
        public boddestinodesc       ?: string,
        public servidor             ?: string,
        public accion               ?: string,
        public serviciodesc         ?: string,
        public serviciocod          ?: string,
        public planvigentedesc      ?: string,
        public plantipo             ?: number,
        public tipopedido           ?: number,
        public plantillasdet        ?: DetallePlantillaBodega[],      
    ) { }   
}