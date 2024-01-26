export class Grabadetallesolicitudbod { //Se ingresan los campos que se usarán para la grabacion de la de-
    constructor(   //volución de la compra

        public sbdeid        ?: number, //campo cantidad a ingresar
        public sbodid        ?: number,
        public codproducto   ?: string, //
        public cantidadsoli  ?: number,
        public cantidaddesp  ?: number, 
        public esticod       ?: number, // tipo docto factura o guia
        public usuariomodif  ?: string, // valor de la grilla o campo
        public fechamodif    ?: string,
        public usuarioelimina?: string,
        public fechaelimina  ?: string,
        public servidor      ?: string,
        public campo         ?: string,
        public meinid        ?: number,
        public stockbodsolici?: number,
        public stockbodorigen?: number
    ) { }
}