export class Resultadoctas {
    numerocuenta: string;
    numidentificacion: string;
    nompaciente: string;
    fecingreso: string;
    feceregreso: string;
    edad: string;
    solid: string;
    receid: string;
    cuentaid: string;
    recenumero: string;
    seleccion: boolean;

    constructor(
        numerocuenta?: string,
        numidentificacion?: string,
        nompaciente?: string,
        fecingreso?: string,
        feceregreso?: string,
        edad?: string,
        solid?: string,
        receid?: string,
        cuentaid?: string,
        recenumero?: string,
        seleccion?: boolean
        ) {
            this.numerocuenta = numerocuenta;
            this.numidentificacion = numidentificacion;
            this.nompaciente = nompaciente;
            this.fecingreso = fecingreso;
            this.feceregreso = feceregreso;
            this.edad = edad;
            this.solid = solid;
            this.receid = receid;
            this.cuentaid = cuentaid;
            this.recenumero = recenumero;
            this.seleccion = false;
            this.seleccion = seleccion;
        }
}
