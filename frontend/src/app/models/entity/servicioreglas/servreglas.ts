export class Servreglas {
    constructor (
        public cmecodigo?: number,
        public esacodigo?: number,
        public hdgcodigo?: number,
        public bodcodigo?: string,
        public descservicio?: string,
        public codservicio?: string,
        public codtiposervicio?: number,
        public bodcontrolados?: number,
        public bodconsignacion?: number,
        public bodinsumos?: number,
        public bodmedicamento?: number,
        public bodgeneral?: number,
        public idproducto?:number,
        public tipo?:string,
    ) {

    }
}
