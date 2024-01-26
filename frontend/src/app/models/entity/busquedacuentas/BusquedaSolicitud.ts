export class BusquedaSolicitud {
  numidentificacion: string;
  nombrepaciente: string;
  paternopaciente: string;
  maternopaciente: string;
  fechadesde: Date;
  fechahasta: Date;
  cuenta: string;
  subcuenta: string;
  nrosolicitud: string;
  nroreceta: string;
  codproducto: string;
  nombreproducto: string;
  folio: string;

  constructor(
    numidentificacion?: string,
    nombrepaciente?: string,
    paternopaciente?: string,
    maternopaciente?: string,
    fechadesde?: Date,
    fechahasta?: Date,
    cuenta?: string,
    subcuenta?: string,
    nrosolicitud?: string,
    nroreceta?: string,
    codproducto?: string,
    nombreproducto?: string,
    folio?: string
    ) {
        this.numidentificacion = numidentificacion;
        this.nombrepaciente = nombrepaciente;
        this.paternopaciente = paternopaciente;
        this.maternopaciente = maternopaciente;
        this.fechadesde = fechadesde;
        this.fechahasta = fechahasta;
        this.cuenta = cuenta;
        this.subcuenta = subcuenta;
        this.nrosolicitud = nrosolicitud;
        this.nroreceta = nroreceta;
        this.codproducto = codproducto;
        this.nombreproducto = nombreproducto;
        this.folio = folio;
    }
}
