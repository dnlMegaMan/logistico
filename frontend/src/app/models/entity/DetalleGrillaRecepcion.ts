export class DetalleGrillaRecepcion{
    constructor (
        
        public campo            ?: string,
        public ocdetestdes      ?: string,
        public ocdetcodmei      ?: string,
        public ocdetcoddes      ?: string,
        public ocdetestado      ?: number,
        public ocdettipoitem    ?: string,
        public ocdetcantreal    ?: number,
        public ocdetmeinid      ?: number,
        public ocdetcantdev     ?: number,
        public ocdetcantmovi    ?: number,
        public ocdetvalcosto    ?: number,
        public ocdetid          ?: number,
        //public preciodocto?: number,
        public ocdetvalunita    ?: number,
        //public cantidadaingresar?: number,
        public ocdetcantrecep   ?: number,
        public fechavencimiento ?: string       
    ) {}
}