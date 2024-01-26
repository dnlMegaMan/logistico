export interface DatosGrabarParametros {
  id: number;
  tipo: number;
  codigo: number;
  descripcion: string;
  estado: 0 | 1;
  accion: 'I' | 'M';
}