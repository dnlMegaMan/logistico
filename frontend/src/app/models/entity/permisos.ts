export class Permisos {
    idusuario: number;
    idaccion: number;

    constructor (
        idusuario?: number,
        idaccion?: number
    ){
        this.idusuario = idusuario;
        this.idaccion = idaccion;
    }
}