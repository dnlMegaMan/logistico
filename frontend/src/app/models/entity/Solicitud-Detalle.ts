export class DeatlleSolicitud{
    constructor (
        public sbdeid               ?: number,
        public sbodid               ?: number,
        public repoid               ?: number,
        public codproducto          ?: string,
        public meinid               ?: number,
        public cantidadsoli         ?: number,
        public cantidaddesp         ?: number,
        public estcod               ?: number,
        public usuariomodif         ?: string,
        public fechamodif           ?: string,
        public usuarioelimina       ?: string,
        public fechaelimina         ?: string,
        public piservidor           ?: string,
        public marca                ?: string,
    ) 
    
    {}  
}