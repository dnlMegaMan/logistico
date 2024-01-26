export class PacientesDetalle {
    tipoidentificacion: number;
    descidentificacion: string;
    docuidentificacion: string;
    paterno: string;
    materno: string;
    nombres: string;
    sexo: string;
    fechanacimiento: string;
    fechahospitaliza: string;
    fechaalta: string;
    camaactual: string;
    estadohospitaliza: string;
    codpaisnacimiento: string;
    direccion: string;
    comuna: string;
    fonofijo: string;
    fonomovil: string;
    cliid: string;

    constructor(
        tipoidentificacion?: number,
        descidentificacion?: string,
        docuidentificacion?: string,
        paterno?: string,
        materno?: string,
        nombres?: string,
        sexo?: string,
        fechanacimiento?: string,
        fechahospitaliza?: string,
        fechaalta?: string,
        camaactual?: string,
        estadohospitaliza?: string,
        codpaisnacimiento?: string,
        direccion?: string,
        comuna?: string,
        fonofijo?: string,
        fonomovil?: string,
        cliid?: string
    ) {
        this.tipoidentificacion = tipoidentificacion;
        this.descidentificacion = descidentificacion;
        this.docuidentificacion = docuidentificacion;
        this.paterno = paterno;
        this.materno = materno;
        this.nombres = nombres;
        this.sexo = sexo;
        this.fechanacimiento = fechanacimiento;
        this.fechahospitaliza = fechahospitaliza;
        this.fechaalta = fechaalta;
        this.camaactual = camaactual;
        this.estadohospitaliza = estadohospitaliza;
        this.codpaisnacimiento = codpaisnacimiento;
        this.direccion = direccion;
        this.comuna = comuna;
        this.fonofijo = fonofijo;
        this.fonomovil = fonomovil;
        this.cliid = cliid;
    
    }
}