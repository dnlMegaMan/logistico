/** El resultado de buscar un servicio para listar en el mantenedor de reglas */
export interface ServicioMantenedorReglas {
  codigo: string;
  descripcion: string;
  tipoServicio: number;
}

/** Las reglas asociadas a un servicio en el mantenedor de reglas. */
export interface ServicioConReglas {
  reglaId: number;
  hdgcodigo: number;
  esacodigo: number;
  cmecodigo: number;
  codigoServicio: string;
  bodegaServicio: number;
  bodegaMedicamento: number;
  bodegaInsumos: number;
  bodegaControlados: number;
  bodegaConsignacion: number;
  /** `0` cuando no existe */
  centroDeCosto: number;
  /** `0` cuando no existe */
  centroDeConsumo: number;
}
