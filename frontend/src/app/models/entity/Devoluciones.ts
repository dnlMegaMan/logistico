export class Devoluciones {
    constructor(

        public ambitocodigo     ?: number,
        public servivcodigo     ?: number,
        public docidentcodigo   ?: number,
        public estsolcodigo     ?: number,
        public idtiporegistro   ?: string,
        public fechadesde       ?: string,
        public fechahasta       ?: string,
        public rutpaciente      ?: number
    ) { }
}