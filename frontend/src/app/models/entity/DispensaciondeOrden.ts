export class DispensaciondeOrden {
    constructor(

        public ambitocodigo     ?: number,
        public servivcodigo     ?: number,
        public docidentcodigo   ?: number,
        public estsolcodigo     ?: number,
        public idtiporegistro   ?: string,
        public fechadesde       ?: string,
        public fechahasta       ?: string,
        public rutpaciente      ?: number,
        public ambito           ?: number,
        public tiporeg          ?: string,
        public estadosol        ?: number,
        public servicio         ?: number,
        public identificacion   ?: number
        


    ) { }
}