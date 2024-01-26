export class Solicitudespacienteproducto {

    constructor(
        public soliid            ?: number,
        public fechacreacionsol  ?: string,
        public fechadispensacion ?: string,
        public lote              ?: string,
        public fechavto          ?: string,
        public idmovimientodet   ?: number,
        public cantdispensada    ?: number,
        public cantdevuelta      ?: number,
        public sodeid            ?: number,
        public cantidadadevolver ?: number,
        public cantsoli          ?: number,
        public codmei            ?: string,
        public meindescri        ?: string,
        public checkgrilla       ?: boolean,
        public marcacheckgrilla  ?: boolean,
        public bloqcampogrilla   ?: boolean,
        public cantadevolver     ?: number,
        public cantrechazo       ?: number,
        public sodecantadev      ?: number,
        public descbodegadestino ?: string,
        public descservicio      ?: string,
        public estado            ?: number,
        public bandera           ?: number
    ) {
    }
}