export class ParamGrabaDetallesOC{
    constructor (
        
        public numerodococ      ?: number,
        public ocdettipoitem    ?: string,
        public ocdetmeinid      ?: number,
        public ocdetcantcalc    ?: number,
        public ocdetcantreal    ?: number,
        public ocfechaanulacion ?: string,
        public ocdetvalcosto    ?: number,
        public orcoid           ?: number,
        public usuario          ?: string,
        public servidor         ?: string
    ) {}
}