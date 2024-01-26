export class PacientesAmbito {
    cliid: string;
    descidentificacion: string;
    docuidentificacion: string;
    paterno: string;
    materno: string;
    nombres: string;
    sexo: string;
    fechanacimiento: string;
    unidadactual: string;
    camaapieza: string;
    camaactual: string;
    paternomedico: string;
    maternomedico: string;
    nombresmedico: string;
    numerocuenta: string;
    numeroestadia: string;

    constructor(
        cliid?: string,
        descidentificacion?: string,
        docuidentificacion?: string,
        paterno?: string,
        materno?: string,
        nombres?: string,
        sexo?: string,
        fechanacimiento?: string,
        unidadactual?: string,
        camaapieza?: string,
        camaactual?: string,
        paternomedico?: string,
        maternomedico?: string,
        nombresmedico?: string,
        numerocuenta?: string,
        numeroestadia?: string,
    ) {
        this.cliid = cliid;
        this.descidentificacion = descidentificacion;
        this.docuidentificacion = docuidentificacion;
        this.paterno = paterno;
        this.materno = materno;
        this.nombres = nombres;
        this.sexo = sexo;
        this.fechanacimiento = fechanacimiento;
        this.unidadactual = unidadactual;
        this.camaapieza = camaapieza;
        this.camaactual = camaactual;
        this.paternomedico = paternomedico;
        this.maternomedico = maternomedico;
        this.nombresmedico = nombresmedico;
        this.numerocuenta = numerocuenta;
        this.numeroestadia = numeroestadia;
    }
}