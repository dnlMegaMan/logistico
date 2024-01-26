export class Traspasos{
    constructor (
        public idtraspaso       ?: number, 
        public servicioorigen   ?: number,
        public abrevsrvorigen   ?: string,
        public descsvrorigen    ?: string,
        public serviciodestino  ?: number,
        public abrevsrvdestino  ?: string,
        public descsvrdestino   ?: string,
        public fechatraspaso    ?:string  ,
        public respontraspaso   ?:string,
        public observtraspaso   ?:string,
        //public canttraspaso     ?: string,
        public bodegaorigen     ?: number,
        public bodegadestino    ?: number
    ) {}
}