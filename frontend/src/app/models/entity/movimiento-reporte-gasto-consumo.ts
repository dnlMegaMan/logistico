export interface MovimientoReporteGastoConsumo {
  tipo: string;
  solicitud: number;
  periodo: string;
  dia: string;
  mes: string;
  ano: string;
  /** Con formato `yyyy-MM-ddThh:mm:ss` */
  fechaSolicitud: string;
  bodega: string;
  nombreBodega: string;
  servicio: string;
  referenciaFin700: string;
  centroCosto: number;
  observaciones: string;
  usuarioSolicitante: string;
  codigoProducto: string;
  nombreProducto: string;
  cantidadSolicitada: number;
  cantidadDespachada: number;
  cantidadDevuelta: number;
}
