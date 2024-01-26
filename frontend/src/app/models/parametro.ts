export interface Parametro {
  id: number;

  /** Tipo de Parametro si es = 0, sino es un parametro */
  tipo: number;

  codigo: number;
  
  descripcion: string;
  
  /**
   * - `0`: Vigente
   * - `1`: No Vigente
   */
  estado: 0 | 1;

  /** Id Usuario responsable de la creacion del parametro */
  username: string;
  
  /**
   * Indica si el registro es modificable por el usuario o no. Aquellos registros que se utilizan 
   * en los programas no se pueden modificar. 'S' - SI es modificable 'N' - NO es modificable por el usuario
   */
  modificable: 'S' | 'N';
}
