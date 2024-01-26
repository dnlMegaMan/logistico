import * as XLXS from 'xlsx';
import { Injectable } from '@angular/core';
import { MovimientoInterfaz } from '../models/entity/movimiento-interfaz';

@Injectable({
  providedIn: 'root',
})
export class ReportesMonitorInterfazCargosService {
  constructor() {}

  async generarExcelCargosHospitalizados(movimientos: MovimientoInterfaz[]): Promise<void> {
    const tablaExcel: any[] = [];

    // Agregar detalles de movimiento
    tablaExcel.push([
      '#ID',
      'Solicitud',
      'Fecha',
      'Tipo operación',
      'Receta',
      'Cuenta',
      'Identificación',
      'Paciente',
      'Servicio',
      'Cama',
      'Código',
      'Descripción',
      'Cantidad',
      'Estado',
      'Observación',
    ]);

    for (const movimiento of movimientos) {
      tablaExcel.push([
        `${movimiento.fdeid}`.trim(),
        `${movimiento.soliid}`.trim(),
        `${movimiento.fecha}`.trim(),
        `${movimiento.tipomovimiento}`.trim(),
        `${movimiento.numeroreceta}`.trim(),
        `${movimiento.ctanumcuenta}`.trim(),
        `${movimiento.identificacion}`.trim(),
        `${movimiento.paciente}`.trim(),
        `${movimiento.servicio}`.trim(),
        `${movimiento.camaactual}`.trim(),
        `${movimiento.mfdemeincodmei}`.trim(),
        `${movimiento.descripcionproducto}`.trim(),
        `${movimiento.mfdecantidad}`.trim(),
        `${movimiento.intcargoestado}`.trim(),
        `${movimiento.intcargoerror}`.trim(),
      ]);
    }

    // Crear excel
    const workbook = XLXS.utils.book_new();

    XLXS.utils.book_append_sheet(workbook, XLXS.utils.aoa_to_sheet(tablaExcel), 'Hoja 1');

    XLXS.writeFile(workbook, `cargos_hospitalizados_${Date.now()}.xlsx`);
  }

  async generarExcelCargosUrgencias(movimientos: MovimientoInterfaz[]): Promise<void> {
    const tablaExcel: any[] = [];

    // Agregar detalles de movimiento
    tablaExcel.push([
      '#ID',
      'Solicitud',
      'Fecha',
      'Tipo operación',
      'Receta',
      'Cuenta',
      'Rut',
      'Paciente',
      'Servicio',
      'Código',
      'Descripción',
      'Cantidad',
      'Estado',
      'Observación',
    ]);

    for (const movimiento of movimientos) {
      tablaExcel.push([
        `${movimiento.fdeid}`.trim(),
        `${movimiento.soliid}`.trim(),
        `${movimiento.fecha}`.trim(),
        `${movimiento.tipomovimiento}`.trim(),
        `${movimiento.numeroreceta}`.trim(),
        `${movimiento.ctanumcuenta}`.trim(),
        `${movimiento.identificacion}`.trim(),
        `${movimiento.paciente}`.trim(),
        `${movimiento.servicio}`.trim(),
        `${movimiento.mfdemeincodmei}`.trim(),
        `${movimiento.descripcionproducto}`.trim(),
        `${movimiento.mfdecantidad}`.trim(),
        `${movimiento.intcargoestado}`.trim(),
        `${movimiento.intcargoerror}`.trim(),
      ]);
    }

    // Crear excel
    const workbook = XLXS.utils.book_new();

    XLXS.utils.book_append_sheet(workbook, XLXS.utils.aoa_to_sheet(tablaExcel), 'Hoja 1');

    XLXS.writeFile(workbook, `cargos_urgencias_${Date.now()}.xlsx`);
  }
}
