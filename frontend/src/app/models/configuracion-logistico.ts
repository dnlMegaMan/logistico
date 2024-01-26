export interface ConfiguracionLogistico {
  /** Rango maximo de meses en los que se puede buscar una solicitud. */
  rangoFechasSolicitudes: number;

  /** 
   * Tiempo maximo de inactividad del usuario antes de que expire la sesion automaticamente. Viene 
   * en milisegundos
   */
  tiempoExpiraSesionMs: number;
}