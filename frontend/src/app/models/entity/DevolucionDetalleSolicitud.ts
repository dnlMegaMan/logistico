export class DevolucionDetalleSolicitud{
    constructor (
        public soliid  ?: number,
        public sodeid  ?: number,
        public articulo  ?: string,
        public articuloid  ?: number,
        public cantsoli  ?: number,
        public cantdispensar  ?: number,
        public cantdispensada  ?: number,
        public observacion   ?:    string,
        public presponsable   ?:  string,
        public pacienteestadia  ?: number,
        public ctacteid  ?: number,
        public clienteid  ?: number,
        public valcosto  ?: number,
        public valVenta  ?: number,
        public unidespachocod  ?: number,
        public unicompracod  ?: number,
        public incobrableFonasa ?:  string,
        public pacienterut ?:  string,
        public cantdevu  ?: number,
        public servidor  ?: string,
        public hdgcodigo  ?: number,
        public esacodigo  ?: number,
        public cmecodigo  ?: number,

    ) 
    
    {}
}