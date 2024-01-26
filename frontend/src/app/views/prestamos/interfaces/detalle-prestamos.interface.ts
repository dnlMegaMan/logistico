export interface DetallePrestamos {
  codigo?: string;
  descripcion?: string;
  cantidadSolicitada?: number;
  cantidadDevuelta?: number;
  cantidadDevolver?: number;
  lote?: string;
  fechaVencimiento?: string;
  saldo?: number;
  update?: boolean;
  create?:boolean
}
