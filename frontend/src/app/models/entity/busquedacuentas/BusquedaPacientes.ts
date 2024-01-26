export class BusquedaPacientes {
    cliid: string;
    numidentificacion: string;
    nompaccompleto: string;
    edad: string;
    nombre: string;
    apepaterno: string;
    apematerno: string;
    constructor(
        cliid?: string,
        numidentificacion?: string,
        nompaccompleto?: string,
        edad?: string,
        nombre?: string,
        apepaterno?: string,
        apematerno?: string
        ) {
            this.cliid = cliid;
            this.numidentificacion = numidentificacion;
            this.nompaccompleto = nompaccompleto;
            this.edad = edad;
            this.nombre = nombre;
            this.apepaterno = apepaterno;
            this.apematerno = apematerno;
        }
}
