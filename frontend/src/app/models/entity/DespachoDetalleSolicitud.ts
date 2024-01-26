export class DespachoDetalleSolicitud{
    constructor (
        public soliid           ?: number,
        public hdgcodigo        ?: number,
        public esacodigo        ?: number,
        public cmecodigo        ?: number,
        public sodeid           ?: number,
        public mfdeid           ?: number,
        public movfid           ?: number,
        public mdevid           ?: number,
        public codmei           ?: string,
        public meindescri       ?: string,
        public meinid           ?: number,
        public cantsoli         ?: number,
        public cantadespachar   ?: number,
        public cantdespachada   ?: number,
        public observaciones    ?: string,
        public usuariodespacha  ?: string,
        public estid            ?: number,
        public ctaid            ?: number,
        public cliid            ?: number,
        public valcosto         ?: number,
        public valventa         ?: number,
        public unidespachocod   ?: number,
        public unicompracod     ?: number,
        public incobfon         ?: string,
        public numdocpac        ?: string,
        public cantdevolucion   ?: number,
        public cantdevuelta     ?: number,
        public tipomovim        ?: string ,
        public servidor         ?: string ,
        public lote             ?: string,
        public fechavto         ?: string,
        public bodorigen        ?: number,
        public boddestino       ?: number,
        public cantrecepcionado ?: number,
        public cantrecepcionada ?: number,
        public cantidadarecepcionar?: number,
        public cantdevolarecepcionar ?: number,
        public cantidadadevolver?: number,
        public codservicioori   ?: number,
        public codservicioactual?: string,
        public stockorigen      ?: number,
        public acciond          ?: string,
        public recetipo         ?: string,
        public receid           ?: number,
        public recenumero       ?: number,
        public sodecantrecepdevo?: number,
        public consumo          ?: string,
        public cantpendienterecepdevol?: number,
        public cantadespacharresp?: number,
        public bloqcampogrilla  ?: boolean,
        public marcacheckgrilla ?: boolean,
        public bloqcampogrilla2 ?: boolean,
        public retira          ?: number,
        public codtipidentificacionretira?: number,
        public numidentificacionretira ?: string,
        public nombresretira    ?: string,
        public codcobroincluido ?: number,
        public tiporeporte ?: string
    )
    {}
}