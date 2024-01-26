/** Interfaz para poder usar la `PuedeDesactivarGuard` */
export interface ComponenteDesactivable {
  puedeDesactivar(): boolean;

  mensajeDesactivacionFallida(); 
}