export interface ConsularParam {
  consulta_list_bodegas: ConsularParamData[];
  consulta_list_productos: ConsularParamData[];
  consultar_tipo_movimientos: ConsularParamData[];
  consultar_tipo_prestamos: ConsularParamData[];
  ingreso_vencimiento: number;
}

export interface ConsularParamData {
  id?: number;
  tipo?: number;
  codigo?: number;
  hdgcodigo?: number;
  esacodigo?: number;
  cmecodigo?: number;
  descripcion?: string;
  servidor?: string;
}
