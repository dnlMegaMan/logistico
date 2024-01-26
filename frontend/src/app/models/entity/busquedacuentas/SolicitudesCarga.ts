export class SolicitudesCarga {
  codestado: string;
  flgestado: string;
  numsol: string;
  numcta: string;
  rut: string;
  fechacreacion: string;

constructor(
  codestado?: string,
  flgestado?: string,
  numsol?: string,
  numcta?: string,
  rut?: string,
  fechacreacion?: string
  ) {
    this.codestado = codestado;
    this.flgestado = flgestado;
    this.numsol = numsol;
    this.numcta = numcta;
    this.rut = rut;
    this.fechacreacion = fechacreacion;
  }
}
