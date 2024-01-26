import { Injectable } from '@angular/core';
import * as XLXS from 'xlsx';
import { MovimientoInterfaz } from '../models/entity/movimiento-interfaz';
import { MovimientoInterfazBodegas } from '../models/entity/movimiento-interfaz-bodegas';
import { Solicitud } from '../models/entity/Solicitud';
import { SolicitudConsumo } from '../models/entity/solicitud-consumo';
import { InterfacesService } from './interfaces.service';

@Injectable({
  providedIn: 'root',
})
export class ReportesVisorErpService {
  constructor(private interfacesService: InterfacesService) {}

  async generarExcelDetalleMovimientoBodega(
    movimientoBodega: MovimientoInterfazBodegas,
  ): Promise<void> {
    const response = await this.interfacesService
      .listarmovimientointerfazbodegas(movimientoBodega)
      .toPromise();

    if (response == null) {
      throw new Error('No existen detalles para el movimiento de bodega');
    }

    const tablaExcel: any[] = [];

    // Crear cabecera
    tablaExcel.push(
      ['N° Solicitud', 'Estado', 'Bodega Solicitante', 'Bodega Suministro', 'Observación'],
      [
        `${movimientoBodega.soliid}`.trim(),
        `${movimientoBodega.interpestado}`.trim(),
        `${movimientoBodega.bodegaorigen}`.trim(),
        `${movimientoBodega.bodegadestino}`.trim(),
        `${movimientoBodega.interperror}`.trim(),
      ],
      [], // Linea en blanco
    );

    // Agregar detalles de movimiento
    tablaExcel.push([
      '#ID',
      'Tipo Movimiento',
      'Código',
      'Descripción',
      'Cantidad',
      'Estado',
      'Observaciones',
    ]);

    for (const detalleMovimiento of response) {
      tablaExcel.push([
        `${detalleMovimiento.id}`.trim(),
        `${detalleMovimiento.tipomovimiento}`.trim(),
        `${detalleMovimiento.codigoarticulo}`.trim(),
        `${detalleMovimiento.descripcionproducto}`.trim(),
        `${detalleMovimiento.cantidad}`.trim(),
        `${detalleMovimiento.interpestado}`.trim(),
        `${detalleMovimiento.interperror}`.trim(),
      ]);
    }

    // Crear excel
    const workbook = XLXS.utils.book_new();

    XLXS.utils.book_append_sheet(workbook, XLXS.utils.aoa_to_sheet(tablaExcel), 'Hoja 1');

    XLXS.writeFile(workbook, `detalle_movimiento_bodega_${Date.now()}.xlsx`);
  }

  /**
   * @param fechaInicio Con formato `yyyy-MM-dd`
   * @param fechaTermino Con formato `yyyy-MM-dd`
   */
  async generarExcelDetallePaciente(
    movimientoPaciente: MovimientoInterfaz,
    fechainicio: string,
    fechatermino: string,
  ): Promise<void> {
    const response = await this.interfacesService
      .listamovimientointerfaz({
        ...movimientoPaciente,
        fechainicio,
        fechatermino,
      })
      .toPromise();

    if (response == null) {
      throw new Error('No existen detalles para el movimiento del paciente');
    }

    const tablaExcel: any[] = [];

    // Crear cabecera
    tablaExcel.push(
      ['N° Solicitud', 'Estado', 'Servicio', 'Cuenta', 'Rut', 'Nombre', 'Observación'],
      [
        `${movimientoPaciente.soliid}`.trim(),
        `${movimientoPaciente.interpestado}`.trim(),
        `${movimientoPaciente.servicio}`.trim(),
        `${movimientoPaciente.ctanumcuenta}`.trim(),
        `${movimientoPaciente.identificacion}`.trim(),
        `${movimientoPaciente.paciente}`.trim(),
        `${movimientoPaciente.interperror}`.trim(),
      ],
      [], // Linea en blanco
    );

    // Agregar detalles de movimiento
    tablaExcel.push([
      '#ID',
      'Tipo Movimiento',
      'Código',
      'Descripción',
      'Cantidad',
      'Estado',
      'Observaciones',
    ]);

    for (const detalleMovimiento of response) {
      tablaExcel.push([
        `${detalleMovimiento.detid}`.trim(),
        `${detalleMovimiento.tipomovimiento}`.trim(),
        `${detalleMovimiento.mfdemeincodmei}`.trim(),
        `${detalleMovimiento.descripcionproducto}`.trim(),
        `${detalleMovimiento.mfdecantidad}`.trim(),
        `${detalleMovimiento.interpestado}`.trim(),
        `${detalleMovimiento.interperror}`.trim(),
      ]);
    }

    // Crear excel
    const workbook = XLXS.utils.book_new();

    XLXS.utils.book_append_sheet(workbook, XLXS.utils.aoa_to_sheet(tablaExcel), 'Hoja 1');

    XLXS.writeFile(workbook, `detalle_movimiento_bodega_${Date.now()}.xlsx`);
  }

  async generarExcelMovimientosBodega(movimientos: MovimientoInterfazBodegas[]): Promise<void> {
    const tablaExcel: any[] = [];

    // Agregar detalles de movimiento
    tablaExcel.push([
      '#ID',
      'Solicitud',
      'Fecha',
      'Bodega Solicitante',
      'Bodega Suministro',
      'Estado',
      'Referencia',
      'Observaciones',
    ]);

    for (const movimiento of movimientos) {
      tablaExcel.push([
        `${movimiento.id}`.trim(),
        `${movimiento.soliid}`.trim(),
        `${movimiento.fecha}`.trim(),
        `${movimiento.bodegaorigen}`.trim(),
        `${movimiento.bodegadestino}`.trim(),
        `${movimiento.interpestado}`.trim(),
        `${movimiento.referenciacontable}`.trim(),
        `${movimiento.interperror}`.trim(),
      ]);
    }

    // Crear excel
    const workbook = XLXS.utils.book_new();

    XLXS.utils.book_append_sheet(workbook, XLXS.utils.aoa_to_sheet(tablaExcel), 'Hoja 1');

    XLXS.writeFile(workbook, `movimiento_bodega_${Date.now()}.xlsx`);
  }

  async generarExcelMovimientosPacientes(listaPacientes: MovimientoInterfaz[]): Promise<void> {
    const tablaExcel: any[] = [];

    // Agregar detalles de movimiento
    tablaExcel.push([
      '#ID',
      'Solicitud',
      'Fecha',
      'Receta',
      'Cuenta',
      'Identificación',
      'Paciente',
      'Servicio',
      'Estado',
      'Referencia',
      'Observaciones',
    ]);

    for (const movimiento of listaPacientes) {
      tablaExcel.push([
        `${movimiento.movid}`.trim(),
        `${movimiento.soliid}`.trim(),
        `${movimiento.fecha}`.trim(),
        `${movimiento.numeroreceta ? movimiento.numeroreceta : ''}`.trim(),
        `${movimiento.ctanumcuenta}`.trim(),
        `${movimiento.identificacion}`.trim(),
        `${movimiento.paciente}`.trim(),
        `${movimiento.servicio}`.trim(),
        `${movimiento.interpestado}`.trim(),
        `${movimiento.referenciacontable}`.trim(),
        `${movimiento.interperror}`.trim(),
      ]);
    }

    // Crear excel
    const workbook = XLXS.utils.book_new();

    XLXS.utils.book_append_sheet(workbook, XLXS.utils.aoa_to_sheet(tablaExcel), 'Hoja 1');

    XLXS.writeFile(workbook, `movimiento_pacientes_${Date.now()}.xlsx`);
  }

  async generarExcelMovimientoBodegasCentrales(
    solicitudesBodegasCentrales: Solicitud[],
  ): Promise<void> {
    const tablaExcel: any[] = [];

    // Agregar detalles de movimiento
    tablaExcel.push([
      '# Solicitud',
      'Fecha',
      'Bodega Solicitante',
      'Bodega Suministro',
      'Estado',
      'Pedido',
      'Observación',
    ]);

    for (const solicitud of solicitudesBodegasCentrales) {
      tablaExcel.push([
        `${solicitud.soliid}`.trim(),
        `${solicitud.fechacreacion}`.trim(),
        `${solicitud.bodorigendesc}`.trim(),
        `${solicitud.boddestinodesc}`.trim(),
        `${solicitud.estadosolicitudde}`.trim(),
        `${solicitud.nropedidofin700erp}`.trim(),
        `${solicitud.errorerp}`.trim(),
      ]);
    }

    // Crear excel
    const workbook = XLXS.utils.book_new();

    XLXS.utils.book_append_sheet(workbook, XLXS.utils.aoa_to_sheet(tablaExcel), 'Hoja 1');

    XLXS.writeFile(workbook, `movimiento_bodegas_centrales_${Date.now()}.xlsx`);
  }

  async generarExcelSolicitudesConsumoGastoServicio(
    solicitudesGastoConsumo: SolicitudConsumo[],
  ): Promise<void> {
    const tablaExcel: any[] = [];

    // Agregar detalles de movimiento
    tablaExcel.push([
      '# Solicitud',
      'Fecha',
      'Centro Costo',
      'Descripción',
      'Estado',
      'Referencia',
      'Observación',
    ]);

    for (const solicitud of solicitudesGastoConsumo) {
      tablaExcel.push([
        `${solicitud.id}`.trim(),
        `${solicitud.fechasolicitud}`.trim(),
        `${solicitud.glosacentrocosto}`.trim(),
        `${solicitud.glosa}`.trim(),
        `${solicitud.glosaestado}`.trim(),
        `${solicitud.referenciacontable}`.trim(),
        `${solicitud.errorerp}`.trim(),
      ]);
    }

    // Crear excel
    const workbook = XLXS.utils.book_new();

    XLXS.utils.book_append_sheet(workbook, XLXS.utils.aoa_to_sheet(tablaExcel), 'Hoja 1');

    XLXS.writeFile(workbook, `movimiento_solicitudes_gasto_consumo_${Date.now()}.xlsx`);
  }
}
