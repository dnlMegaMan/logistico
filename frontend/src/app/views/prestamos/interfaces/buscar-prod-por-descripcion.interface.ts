import { ConsularParamData } from "./consular-param.interface";

export interface BuscaProdPorDescripcion {
  idbodega?: number;
  descripcion?: string;
  hdgcodigo?: number;
  esacodigo?: number;
  cmecodigo?: number;
  codigo?: string;
  tipodeproducto?: string;
}

export interface Medicamento {
  hdgcodigo?: number;
  esacodigo?: number;
  cmecodigo?: number;
  mein?: number;
  codigo?: string;
  descripcion?: string;
  tiporegistro?: string;
  tipomedicamento?: number;
  valorcosto?: number;
  margenmedicamento?: number;
  valorventa?: number;
  unidadcompra?: number;
  unidaddespacho?: number;
  incobfonasa?: string;
  tipoincob?: string;
  estado?: number;
  clasificacion?: number;
  recetaretenida?: string;
  solocompra?: string;
  preparados?: string;
  familia?: number;
  subfamilia?: number;
  codpact?: number;
  codpres?: number;
  codffar?: number;
  controlado?: string;
  campo?: string;
  principioactivo?: string;
  presentacion?: string;
  formafarma?: string;
  desunidaddespacho?: string;
  consignacion?: string;
  desctiporegistro?: string;
  fechainiciovigencia?: string;
  fechafinvigencia?: string;
  mein_codigo_cum?: string;
  mein_registro_invima?: string;
  saldo?: number;
  mensaje?: string;
  vigencia?: boolean;
}

export interface BuscarPrestamo {
  id?: number;
  tipoMov?: string;
  prestamo?: number;
  origen?: ConsularParamData[];
  destino?: ConsularParamData[];
  responsable?: string;
  fecha_prestamo?: string;
  estadoID?: number;
  estadoDes?: string;
  idOrigen?: number;
  idDestino?: number;
  fechaDes?: string;
  fechaHas?: string;
  descripcion?: string;
  observaciones?: string;
  hdgcodigo?: number;
  esacodigo?: number;
  cmecodigo?: number;
  usuario?: string;
  servidor?: string;
}

export interface PrestamoDet {
  id?: number;
  codigo?: string;
  fpre_id?: number;
  codmei?: string;
  descripcion?: string;
  mein_id?: number;
  cant_solicitada?: number;
  cant_devuelta?: number;
  cant_devolver?: number;
  codigo_cum?: string;
  registro_invima?: string;
  lote?: string;
  fecha_vto?: string;
  saldo?: number;
  update?: boolean;
  create?: boolean
}

export interface PrestamoMov {
  id?: number;
  codigo?: string;
  uuid?: number;
  mein_id?: number;
  fpre_id?: number;
  fecha?: string;
  codigo_cum?: string;
  registro_invima?: string;
  cantidad?: number;
  responsable?: string;
  movimiento?: string;
  lote?: string;
  fecha_vto?: string;
  create?: boolean
}

export interface RespuestaPrestamo {
  Servidor?: string;
  prestamo?: BuscarPrestamo[];
  prestamo_det?: PrestamoDet[];
  prestamo_mov?: PrestamoMov[];
}
