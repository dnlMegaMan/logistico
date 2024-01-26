export class GrabaSolicitud {
    constructor(

        public campo            ?: string,
        public solbodid         ?: number,
        public sbodid           ?: number,
        public meinid           ?: number,
        public hdgcodigo        ?: number,
        public esacodigo        ?: number,
        public cmecodigo        ?: number,
        public bodegaorigen     ?: number,
        public bodegadestino    ?: number,
        public responsable      ?: string,
        public numsolicitud     ?: number,
        public esticod          ?: number,
        public prioridadcod     ?: number,
        public servidor         ?: string,
        public fechacrea        ?: string,
        public usuariomodif     ?: string,
        public fechamodif       ?: string,
        public usuarioelimina   ?: string,
        public fechaelimina     ?: string
    ) { }
}