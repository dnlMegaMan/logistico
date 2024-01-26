import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import 'rxjs/add/operator/map';
import { Observable } from 'rxjs';
import { UrlReporte } from '../models/entity/Urlreporte';
import { environment } from '../../environments/environment';
import { FiltroERP } from '../models/entity/FiltroERP';
import { RecetasGeneradas } from '../models/table';
import { ConsultaLibroControlado } from '../models/entity/ConsultaLibroControlado';
import * as XLXS from 'xlsx';
import { DatePipe } from '@angular/common';
import { MovimientoReporteGastoConsumo } from '../models/entity/movimiento-reporte-gasto-consumo';
import { ReporteImprimeListaConteoInventario } from '../models/entity/ReporteImprimeListaConteoInventario';

@Injectable()
export class InformesService {
  public urlrptinforme: string = sessionStorage.getItem('enlace').toString().concat('/obtieneurlinfexistenciasvalorizadas');//"http://172.25.108.236:8194/obtieneurlinfexistenciasvalorizadas";
  public urlrptcomprobante: string = sessionStorage.getItem('enlace').toString().concat('/obtieneurlinflistaconteoinventario');
  public urlinfdespachobodegas: string = sessionStorage.getItem('enlace').toString().concat('/obtieneurlinfdespachobodegas');
  public urlrptsolicitud: string = sessionStorage.getItem('enlace').toString().concat('/geturladministracionsolicpac');
  public urlrptsolicituddesppac: string = sessionStorage.getItem('enlace').toString().concat('/geturldispensarsolicpac');
  public urlrptsolicitudbod: string = sessionStorage.getItem('enlace').toString().concat('/geturladministracionsolicbod');
  public urlrptsolicituddespbod: string = sessionStorage.getItem('enlace').toString().concat('/geturldespacharsolicbod');
  public urlrptsolicitudrecepbod: string = sessionStorage.getItem('enlace').toString().concat('/geturlrecepcionarsolicbod');
  public urlrptsolicituddevol: string = sessionStorage.getItem('enlace').toString().concat('/geturldevolversolicbod');
  public urlrptsolicitudrecepdevol: string = sessionStorage.getItem('enlace').toString().concat('/geturlrecepdevolsolicbod');
  public urlrptcierrelibrocontrolado: string = sessionStorage.getItem('enlace').toString().concat('/geturlstocklibcontrolados');
  public urlrptlibrocontrolado: string = sessionStorage.getItem('enlace').toString().concat('/geturlconsultalibcontrolados');
  public urlrptconsultarecambu: string = sessionStorage.getItem('enlace').toString().concat('/geturlconsultarecetaprog');
  public urlrptrecepdevolpac: string = sessionStorage.getItem('enlace').toString().concat('');
  public urlrptmovimiento: string = sessionStorage.getItem('enlace').toString().concat('/geturlmovimientos');
  public urlrptstockbodega: string = sessionStorage.getItem('enlace').toString().concat('/geturlstockdebodega')
  public urlrptcierrekardex: string = sessionStorage.getItem('enlace').toString().concat('/geturlstockcierrekardex');
  public urlrptconsultakardex: string = sessionStorage.getItem('enlace').toString().concat('/geturlconsultacierrekardex');
  public urlrptsolicituddespreceta: string = sessionStorage.getItem('enlace').toString().concat('/geturldespachoreceta');
  public urlrptcontrolstockminimo: string = sessionStorage.getItem('enlace').toString().concat('/geturlcontrolstockmin');
  public urlrptlistaconteoinven: string = sessionStorage.getItem('enlace').toString().concat('/obtieneurlinflistaconteoinventario')
  public urlrptconsolidadoxdevol: string = sessionStorage.getItem('enlace').toString().concat('/obtieneurlinfconsolidadodevoluciones');
  public urlrpttendencias: string = sessionStorage.getItem('enlace').toString().concat('/obtieneurlinftendenciaconsumo');
  public urlrptconsumopacxbod: string = sessionStorage.getItem('enlace').toString().concat('/');
  public urlrptsolicitudautopedido: string = sessionStorage.getItem('enlace').toString().concat('/geturlsolicitudautopedido');
  public urlrptplantilla: string = sessionStorage.getItem('enlace').toString().concat('/geturlplantillas');
  public urlrptsolicitudconsumo: string = sessionStorage.getItem('enlace').toString().concat('/geturlsolicitudconsumo');
  public urlpanelintegracionerp: string = sessionStorage.getItem('enlace').toString().concat('/geturlpanelintegracionerp');
  public urlrptpedidosgastoservicio: string = sessionStorage.getItem('enlace').toString().concat('/geturlreportepedidogastoservicio');
  public urlpanelintegracionerpmasivo: string = sessionStorage.getItem('enlace').toString().concat('/geturlpanelintegracionerpmasivo');
  public urlrptimprimerecetaanulada: string = sessionStorage.getItem('enlace').toString().concat('/geturlrptimprimerecetaanulada');
  public urlrptimprimerecetaanuladatotal: string = sessionStorage.getItem('enlace').toString().concat('/geturlrptimprimerecetaanuladatotal');
  public urlreporterecetasgeneradas: string = sessionStorage.getItem('enlace').toString().concat('/geturlreporterecetasgeneradas');
  private urlreporterecepcionentrebodegas: string = sessionStorage.getItem('enlace').toString().concat('/geturlreporterecepcionentrebodegas');
  private urlobtieneurlconteomanualinventario: string = sessionStorage.getItem('enlace').toString().concat('/obtieneurlconteomanualinventario');

  constructor(public _http: HttpClient, private datePipe: DatePipe,) { }

  private getHES() {
    return {
      hdgcodigo: Number(sessionStorage.getItem('hdgcodigo').toString()),
      esacodigo: Number(sessionStorage.getItem('esacodigo').toString()),
      cmecodigo: Number(sessionStorage.getItem('cmecodigo').toString()),
      servidor: environment.URLServiciosRest.ambiente,
      usuario: environment.privilegios.usuario,
    }
  }

  RPTListadoInventario(tiporeport: string, codigo: number, tiporeg: string, hdgcodigo: number, esacodigo: number, cmecodigo: number): Observable<UrlReporte[]> {
    return this._http.post<UrlReporte[]>(this.urlrptcomprobante, {
      'tiporeport': tiporeport,
      'codigo': codigo,
      'tiporeg': tiporeg,
      'hdgcodigo': hdgcodigo,
      'esacodigo': esacodigo,
      'cmecodigo': cmecodigo
    });
  }

  RPTInformeExistencias(servidor: string, tiporeport: string, codigobod: number, tiporeg: string, fecha: string, hdgcodigo: number,
    esacodigo: number, cmecodigo: number,language: string ): Observable<UrlReporte> {
    return this._http.post<UrlReporte>(this.urlrptinforme, {
      servidor,
      tiporeport,
      codigobod,
      tiporeg,
      fecha,
      hdgcodigo,
      esacodigo,
      cmecodigo,
      language
    });
  }

  RPTInfDespachoABodegas(tiporeport: string, bodega: number, movimiento: number, tipoprod: string, fechaini: string,
    fechafin: string, hdgcodigo: number, esacodigo: number, cmecodigo: number): Observable<UrlReporte[]> {
    return this._http.post<UrlReporte[]>(this.urlinfdespachobodegas, {
      'tiporeport': tiporeport,
      'bodega': bodega,
      'movimiento': movimiento,
      'tipoprod': tipoprod,
      'fechaini': fechaini,
      'fechafin': fechafin,
      'hdgcodigo': hdgcodigo,
      'esacodigo': esacodigo,
      'cmecodigo': cmecodigo
    });
  }

  RPTImprimeSolicitud(servidor: string, hdgcodigo: number, esacodigo: number, cmecodigo: number,
    tiporeport: string, soliid: number, codambito: number): Observable<UrlReporte[]> {
    return this._http.post<UrlReporte[]>(this.urlrptsolicitud, {
      'servidor': servidor,
      'hdgcodigo': hdgcodigo,
      'esacodigo': esacodigo,
      'cmecodigo': cmecodigo,
      'tiporeport': tiporeport,
      'soliid': soliid,
      'codambito': codambito

    });
  }

  RPTImprimeSolicitudDespachada(servidor: string, hdgcodigo: number, esacodigo: number, cmecodigo: number,
    tiporeport: string, soliid: number, codambito: number): Observable<UrlReporte[]> {
    return this._http.post<UrlReporte[]>(this.urlrptsolicituddesppac, {
      'servidor': servidor,
      'hdgcodigo': hdgcodigo,
      'esacodigo': esacodigo,
      'cmecodigo': cmecodigo,
      'tiporeport': tiporeport,
      'soliid': soliid,
      'codambito': codambito

    });
  }

  RPTImprimeSolicitudBodega(servidor: string, hdgcodigo: number, esacodigo: number, cmecodigo: number,
    tiporeport: string, soliid: number): Observable<UrlReporte[]> {
    return this._http.post<UrlReporte[]>(this.urlrptsolicitudbod, {
      'servidor': servidor,
      'hdgcodigo': hdgcodigo,
      'esacodigo': esacodigo,
      'cmecodigo': cmecodigo,
      'tiporeport': tiporeport,
      'soliid': soliid
    });
  }

  RPTImprimeSolicitudDespachoBodega(servidor: string, hdgcodigo: number, esacodigo: number, cmecodigo: number,
    tiporeport: string, soliid: number): Observable<UrlReporte[]> {
    return this._http.post<UrlReporte[]>(this.urlrptsolicituddespbod, {
      'servidor': servidor,
      'hdgcodigo': hdgcodigo,
      'esacodigo': esacodigo,
      'cmecodigo': cmecodigo,
      'tiporeport': tiporeport,
      'soliid': soliid
    });
  }

  reporteRecepcionEntreBodegas(solicitudId: number, tipoReporte: 'pdf'): Promise<UrlReporte> {
    return this._http.post<UrlReporte>(this.urlreporterecepcionentrebodegas, {
      ...this.getHES(),
      tipoReporte,
      solicitudId,
    })
      .toPromise();
  }

  RPTImprimeSolicitudRecepcionDespBodega(servidor: string, hdgcodigo: number, esacodigo: number, cmecodigo: number,
    tiporeport: string, soliid: number): Observable<UrlReporte[]> {
    return this._http.post<UrlReporte[]>(this.urlrptsolicitudrecepbod, {
      'servidor': servidor,
      'hdgcodigo': hdgcodigo,
      'esacodigo': esacodigo,
      'cmecodigo': cmecodigo,
      'tiporeport': tiporeport,
      'soliid': soliid
    });
  }

  RPTImprimeDevolucionSolicitudBodega(servidor: string, hdgcodigo: number, esacodigo: number, cmecodigo: number,
    tiporeport: string, soliid: number): Observable<UrlReporte[]> {
    return this._http.post<UrlReporte[]>(this.urlrptsolicituddevol, {
      'servidor': servidor,
      'hdgcodigo': hdgcodigo,
      'esacodigo': esacodigo,
      'cmecodigo': cmecodigo,
      'tiporeport': tiporeport,
      'soliid': soliid
    });
  }

  RPTImprimeRecepDevolSolicitudBodega(servidor: string, hdgcodigo: number, esacodigo: number, cmecodigo: number,
    tiporeport: string, soliid: number, usuario: string): Observable<UrlReporte[]> {
    return this._http.post<UrlReporte[]>(this.urlrptsolicitudrecepdevol, {
      'servidor': servidor,
      'hdgcodigo': hdgcodigo,
      'esacodigo': esacodigo,
      'cmecodigo': cmecodigo,
      'tiporeport': tiporeport,
      'soliid': soliid,
      'usuario': usuario
    });
  }

  RPTImprimeLibroControlado(servidor: string, usuario: string, hdgcodigo: number,
    esacodigo: number, cmecodigo: number, tiporeport: string, libcid: number,
    codbodegacontrolados: number, meinid: number): Observable<UrlReporte[]> {
    return this._http.post<UrlReporte[]>(this.urlrptlibrocontrolado, {
      'servidor': servidor,
      'usuario': usuario,
      'hdgcodigo': hdgcodigo,
      'esacodigo': esacodigo,
      'cmecodigo': cmecodigo,
      'tiporeport': tiporeport,
      'libcid': libcid,
      'codbodegacontrolados': codbodegacontrolados,
      'meinid': meinid
    });
  }

  RPTImprimeExcelLibroControlado(bodega: string, periodo: string, codigoProducto: string,
    descripcionProducto: string, usuario: string, emitidoEl: Date, movimientos: ConsultaLibroControlado[],
  ) {
    const tablaExcel: any[] = [];

    // Cabecera del libro controlado
    tablaExcel.push([
      'Bodega',
      'Periodo',
      'Código Producto',
      'Descripcion Producto',
      'Emitido Por',
      'Emitido El',
    ]);

    tablaExcel.push([
      bodega,
      periodo,
      codigoProducto.trim(),
      descripcionProducto.trim(),
      usuario,
      this.datePipe.transform(emitidoEl, 'yyyy-MM-dd HH:mm:ss'),
    ]);

    tablaExcel.push([]);

    // Movimientos
    tablaExcel.push([
      'Correlativo',
      'Fecha Movimiento',
      'Movimiento',
      'N° Receta',
      'N° Solicitud',
      'N° Ref. Fin700',
      'Rut Paciente',
      'Nombre Paciente',
      'RUT Médico',
      'Nombre Médico',
      'Cantidad Entrada',
      'Cantidad Salida',
      'Saldo',
    ]);

    for (const movimiento of movimientos) {
      tablaExcel.push([
        `${movimiento.correlativo}`.trim(),
        `${this.datePipe.transform(movimiento.movimfecha, 'yyyy-MM-dd HH:mm:ss')}`.trim(),
        `${movimiento.movimdescri}`.trim(),
        `${movimiento.nroreceta}`.trim(),
        `${movimiento.nrosolicitud}`.trim(),
        `${movimiento.referencia}`.trim(),
        `${movimiento.rutprof}`.trim(),
        `${movimiento.nombreprof}`.trim(),
        `${movimiento.rutpaciente}`.trim(),
        `${movimiento.nombrepaciente}`.trim(),
        `${movimiento.cantidadentrada}`.trim(),
        `${movimiento.cantidadsalida}`.trim(),
        `${movimiento.cantidadsaldo}`.trim(),
      ]);
    }

    // Crear excel
    const workbook = XLXS.utils.book_new();

    XLXS.utils.book_append_sheet(workbook, XLXS.utils.aoa_to_sheet(tablaExcel), 'Hoja 1');

    XLXS.writeFile(workbook, `libro_controlado_${Date.now()}.xlsx`);
  }

  RPTImprimeCierreLibroControlado(servidor: string, usuario: string, hdgcodigo: number,
    esacodigo: number, cmecodigo: number, tiporeport: string, codbodegacontrolados: number
  ): Observable<UrlReporte[]> {
    return this._http.post<UrlReporte[]>(this.urlrptcierrelibrocontrolado, {
      'servidor': servidor,
      'usuario': usuario,
      'hdgcodigo': hdgcodigo,
      'esacodigo': esacodigo,
      'cmecodigo': cmecodigo,
      'tiporeport': tiporeport,
      'codbodegacontrolados': codbodegacontrolados
    });
  }

  RPTImprimeConsultaRecetaAmbulatoria(servidor: string, usuario: string, hdgcodigo: number,
    esacodigo: number, cmecodigo: number, tiporeport: string, cliid: number
  ): Observable<UrlReporte[]> {
    return this._http.post<UrlReporte[]>(this.urlrptconsultarecambu, {
      'servidor': servidor,
      'usuario': usuario,
      'hdgcodigo': hdgcodigo,
      'esacodigo': esacodigo,
      'cmecodigo': cmecodigo,
      'tiporeport': tiporeport,
      'cliid': cliid
    });
  }

  RPTImprimeRecepcionDevolucionPaciente(servidor: string, hdgcodigo: number, esacodigo: number, cmecodigo: number,
    tiporeport: string, soliid: number): Observable<UrlReporte[]> {
    return this._http.post<UrlReporte[]>(this.urlrptrecepdevolpac, {
      'servidor': servidor,
      'hdgcodigo': hdgcodigo,
      'esacodigo': esacodigo,
      'cmecodigo': cmecodigo,
      'tiporeport': tiporeport,
      'soliid': soliid
    });
  }

  RPTImprimeMovimiento(servidor: string, usuario: string, hdgcodigo: number, esacodigo: number, cmecodigo: number,
    tiporeport: string, movfid: number): Observable<UrlReporte[]> {
    return this._http.post<UrlReporte[]>(this.urlrptmovimiento, {
      'servidor': servidor,
      'usuario': usuario,
      'hdgcodigo': hdgcodigo,
      'esacodigo': esacodigo,
      'cmecodigo': cmecodigo,
      'tiporeport': tiporeport,
      'movfid': movfid

    });
  }

  RPTImprimeStockBodega(servidor: string, usuario: string, hdgcodigo: number, esacodigo: number, cmecodigo: number,
    tiporeport: string, FbodCodigo: number, FboCodigoBodega: string): Observable<UrlReporte[]> {
    return this._http.post<UrlReporte[]>(this.urlrptstockbodega, {
      'servidor': servidor,
      'usuario': usuario,
      'hdgcodigo': hdgcodigo,
      'esacodigo': esacodigo,
      'cmecodigo': cmecodigo,
      'tiporeport': tiporeport,
      'FbodCodigo': FbodCodigo,
      'FboCodigoBodega': FboCodigoBodega

    });
  }

  RPTImprimeCierreKardex(servidor: string, usuario: string, hdgcodigo: number,
    esacodigo: number, cmecodigo: number, tiporeport: string, codbodega: number
  ): Observable<UrlReporte[]> {
    return this._http.post<UrlReporte[]>(this.urlrptcierrekardex, {
      'servidor': servidor,
      'usuario': usuario,
      'hdgcodigo': hdgcodigo,
      'esacodigo': esacodigo,
      'cmecodigo': cmecodigo,
      'tiporeport': tiporeport,
      'codbodega': codbodega
    });
  }

  RPTImprimeConsultaKardex(servidor: string, usuario: string, hdgcodigo: number,
    esacodigo: number, cmecodigo: number, tiporeport: string, ckarid: number,
    codbodega: number, meinid: number): Observable<UrlReporte[]> {
    return this._http.post<UrlReporte[]>(this.urlrptconsultakardex, {
      'servidor': servidor,
      'usuario': usuario,
      'hdgcodigo': hdgcodigo,
      'esacodigo': esacodigo,
      'cmecodigo': cmecodigo,
      'tiporeport': tiporeport,
      'ckarid': ckarid,
      'codbodega': codbodega,
      'meinid': meinid
    });
  }

  RPTImprimeSolicitudDespachoReceta(servidor: string, usuario: string, hdgcodigo: number,
    esacodigo: number, cmecodigo: number, tiporeport: string, tipo: number, soliid: number,
    receid: number): Observable<UrlReporte[]> {
    return this._http.post<UrlReporte[]>(this.urlrptsolicituddespreceta, {
      'servidor': servidor,
      'usuario': usuario,
      'hdgcodigo': hdgcodigo,
      'esacodigo': esacodigo,
      'cmecodigo': cmecodigo,
      'tiporeport': tiporeport,
      'tipo': tipo,
      'soliid': soliid,
      'receid': receid
    });
  }

  RPTImprimeControlStockMinimo(servidor: string, usuario: string, hdgcodigo: number, esacodigo: number, cmecodigo: number,
    tiporeport: string, fechainicio: string, fechatermino: string, idbodegasolicita: number,
    idbodegasuministro: number, idarticulo: number): Observable<UrlReporte[]> {
    return this._http.post<UrlReporte[]>(this.urlrptcontrolstockminimo, {
      'servidor': servidor,
      'usuario': usuario,
      'hdgcodigo': hdgcodigo,
      'esacodigo': esacodigo,
      'cmecodigo': cmecodigo,
      'tiporeport': tiporeport,
      'fechainicio': fechainicio,
      'fechatermino': fechatermino,
      'idbodegasolicita': idbodegasolicita,
      'idbodegasuministro': idbodegasuministro,
      'idarticulo': idarticulo
    });
  }

  RPTImprimeListaConteoInventario(reporte: ReporteImprimeListaConteoInventario): Observable<UrlReporte[]> {
    return this._http.post<UrlReporte[]>(this.urlrptlistaconteoinven, reporte);
  }

  RPTImprimeConsolidadoPorDevoluciones(servidor: string, usuario: string, tiporeport: string,
    tiporeg: string, tipomed: number, fechaini: string, fechafin: string,
    hdgcodigo: number, esacodigo: number, cmecodigo: number,
  ): Observable<UrlReporte[]> {
    return this._http.post<UrlReporte[]>(this.urlrptconsolidadoxdevol, {
      'servidor': servidor,
      'usuario': usuario,
      'tiporeport': tiporeport,
      'tiporeg': tiporeg,
      'tipomed': tipomed,
      'fechaini': fechaini,
      'fechafin': fechafin,
      'hdgcodigo': hdgcodigo,
      'esacodigo': esacodigo,
      'cmecodigo': cmecodigo,
    });
  }

  RPTImprimeTendenciasConsumoBodegas(servidor: string, usuario: string, tiporeport: string, tiporeg: string,
    tipomed: number, fechaini: string, fechafin: string, codbodega: number, hdgcodigo: number,
    esacodigo: number, cmecodigo: number): Observable<UrlReporte[]> {
    return this._http.post<UrlReporte[]>(this.urlrpttendencias, {
      'servidor': servidor,
      'usuario': usuario,
      'tiporeport': tiporeport,
      'tiporeg': tiporeg,
      'tipomed': tipomed,
      'fechaini': fechaini,
      'fechafin': fechafin,
      'codbodega': codbodega,
      'hdgcodigo': hdgcodigo,
      'esacodigo': esacodigo,
      'cmecodigo': cmecodigo,
    });
  }

  RPTImprimeConsumoPacienteXBodegas(servidor: string, usuario: string, tiporeport: string,
    bodcodigo: number, tiporeg: string, hdgcodigo: number, esacodigo: number, cmecodigo: number,
  ): Observable<UrlReporte[]> {
    return this._http.post<UrlReporte[]>(this.urlrptconsumopacxbod, {
      'servidor': servidor,
      'usuario': usuario,
      'tiporeport': tiporeport,
      'bodcodigo': bodcodigo,
      'tiporeg': tiporeg,
      'hdgcodigo': hdgcodigo,
      'esacodigo': esacodigo,
      'cmecodigo': cmecodigo,
    });
  }

  RPTImprimeSolicitudAutopedido(servidor: string, hdgcodigo: number, esacodigo: number, cmecodigo: number,
    tiporeport: string, soliid: number, codambito: number): Observable<UrlReporte[]> {
    return this._http.post<UrlReporte[]>(this.urlrptsolicitudautopedido, {
      'servidor': servidor,
      'hdgcodigo': hdgcodigo,
      'esacodigo': esacodigo,
      'cmecodigo': cmecodigo,
      'tiporeport': tiporeport,
      'soliid': soliid,
      'codambito': codambito

    });
  }

  RPTImprimePlantillas(servidor: string, hdgcodigo: number, esacodigo: number, cmecodigo: number, tiporeport: string,
    planid: number, plantipo: number, usuario: string): Observable<UrlReporte[]> {
    return this._http.post<UrlReporte[]>(this.urlrptplantilla, {
      'servidor': servidor,
      'hdgcodigo': hdgcodigo,
      'esacodigo': esacodigo,
      'cmecodigo': cmecodigo,
      'tiporeport': tiporeport,
      'planid': planid,
      'plantipo': plantipo,
      'usuario': usuario
    });
  }

  RPTImprimePanelIntegracionERP(servidor: string, hdgcodigo: number, esacodigo: number, cmecodigo: number,
    usuario: string, tipoDoc: string, fechadesde: string, fechahasta: string, sol: number, solcon: number,
    tipo: number): Observable<UrlReporte[]> {
    return this._http.post<UrlReporte[]>(this.urlpanelintegracionerp, {
      'servidor': servidor,
      'hdgcodigo': hdgcodigo,
      'esacodigo': esacodigo,
      'cmecodigo': cmecodigo,
      'usuario': usuario,
      'tiporeport': tipoDoc,
      'fechadesde': fechadesde,
      'fechahasta': fechahasta,
      'soliid': sol,
      'solicon': solcon,
      'tipo': tipo
    });
  }

  RPTImprimeSolicitudConsumo(servidor: string, hdgcodigo: number, esacodigo: number, cmecodigo: number,
    tiporeport: string, usuario: string, soliid: number): Observable<UrlReporte[]> {
    return this._http.post<UrlReporte[]>(this.urlrptsolicitudconsumo, {
      'servidor': servidor,
      'hdgcodigo': hdgcodigo,
      'esacodigo': esacodigo,
      'cmecodigo': cmecodigo,
      'tiporeport': tiporeport,
      'usuario': usuario,
      'soliid': soliid
    });
  }


  RPTImprimePedidosConGastoServicio(
    servidor: string, hdgcodigo: number, esacodigo: number, cmecodigo: number, usuario: string,
    tiporeport: 'pdf', fechadesde: string, fechahasta: string
  ): Promise<UrlReporte | null>;

  RPTImprimePedidosConGastoServicio(
    servidor: string, hdgcodigo: number, esacodigo: number, cmecodigo: number, usuario: string,
    tiporeport: 'xls', fechadesde: string, fechahasta: string
  ): Promise<void>;

  async RPTImprimePedidosConGastoServicio(
    servidor: string, hdgcodigo: number, esacodigo: number, cmecodigo: number, usuario: string,
    tiporeport: 'pdf' | 'xls', fechadesde: string, fechahasta: string
  ): Promise<any> {
    const response = await this._http
      .post<any>(this.urlrptpedidosgastoservicio, {
        servidor: servidor,
        hdgcodigo: hdgcodigo,
        esacodigo: esacodigo,
        cmecodigo: cmecodigo,
        tiporeport: tiporeport,
        usuario: usuario,
        fechadesde: fechadesde,
        fechahasta: fechahasta,
      })
      .toPromise();

    if (tiporeport === 'pdf') {
      return response && response.length > 0 ? response[0] : null;
    } else if (tiporeport === 'xls') {
      const tablaExcel: any[] = [];

      // Crear cabecera
      tablaExcel.push([
        'Tipo',
        'Solicitud',
        'Periodo',
        'Día',
        'Mes',
        'Año',
        'Fecha solicitud',
        'Bodega',
        'Nombre bodega',
        'Servicio',
        'N° de referencia Fin 700',
        'Centro de costo',
        'Observaciones',
        'Usuario solicitante',
        'Código del producto',
        'Nombre del producto',
        'Cantidad solicitada',
        'Cantidad despachada',
        'Cantidad devuelta',
      ]);

      const movimientos: MovimientoReporteGastoConsumo[] = response ? response : []
      for (const movimiento of movimientos) {
        tablaExcel.push([
          `${movimiento.tipo}`.trim(),
          `${movimiento.solicitud}`.trim(),
          `${movimiento.periodo}`.trim(),
          `${movimiento.dia}`.trim(),
          `${movimiento.mes}`.trim(),
          `${movimiento.ano}`.trim(),
          `${movimiento.fechaSolicitud}`.trim(),
          `${movimiento.bodega}`.trim(),
          `${movimiento.nombreBodega}`.trim(),
          `${movimiento.servicio}`.trim(),
          `${movimiento.referenciaFin700}`.trim(),
          `${movimiento.centroCosto}`.trim(),
          `${movimiento.observaciones}`.trim(),
          `${movimiento.usuarioSolicitante}`.trim(),
          `${movimiento.codigoProducto}`.trim(),
          `${movimiento.nombreProducto}`.trim(),
          `${movimiento.cantidadSolicitada}`.trim(),
          `${movimiento.cantidadDespachada}`.trim(),
          `${movimiento.cantidadDevuelta}`.trim(),
        ]);
      }

      // Crear excel
      const workbook = XLXS.utils.book_new();

      XLXS.utils.book_append_sheet(workbook, XLXS.utils.aoa_to_sheet(tablaExcel), 'Hoja 1');

      XLXS.writeFile(workbook, `informe_pedidos_gasto_consumo_${fechadesde}_${fechahasta}.xlsx`);
    } else {
      throw new Error('Tipo de reporte desconocido');
    }
  }

  RPTImprimePanelIntegracionERPMasivo(filtro: FiltroERP): Observable<UrlReporte[]> {
    return this._http.post<UrlReporte[]>(this.urlpanelintegracionerpmasivo, {
      'filtro': filtro
    });

  }
  RPTImprimeRecetaAnulada(servidor: string, hdgcodigo: number, esacodigo: number, cmecodigo: number,
    tiporeport: string, soliid: number, codambito: number): Observable<UrlReporte[]> {
    return this._http.post<UrlReporte[]>(this.urlrptimprimerecetaanulada, {
      'servidor': servidor,
      'hdgcodigo': hdgcodigo,
      'esacodigo': esacodigo,
      'cmecodigo': cmecodigo,
      'tiporeport': tiporeport,
      'soliid': soliid,
      'codambito': codambito

    });
  }

  RPTImprimeRecetaAnuladaLista(servidor: string, hdgcodigo: number, esacodigo: number, cmecodigo: number,
    tiporeport: string, codambito: number, receid: number, fechadesde: string, fechahasta: string,
    tipidentificacionpac: number, numidentificacionpac: string, nombrepac: string, apepaternopac: string,
    apematernopac: string): Observable<UrlReporte[]> {
    return this._http.post<UrlReporte[]>(this.urlrptimprimerecetaanuladatotal, {
      'servidor': servidor,
      'hdgcodigo': hdgcodigo,
      'esacodigo': esacodigo,
      'cmecodigo': cmecodigo,
      'tiporeport': tiporeport,
      'codambito': codambito,
      'receid': receid,
      'fechadesde': fechadesde,
      'fechahasta': fechahasta,
      'tipidentificacionpac': tipidentificacionpac,
      'numidentificacionpac': numidentificacionpac,
      'nombrepac': nombrepac,
      'apepaternopac': apepaternopac,
      'apematernopac': apematernopac
    });
  }

  RPTImprimeRecetasGeneradas(servidor: string, hdgcodigo: number, esacodigo: number, cmecodigo: number, usuario: string,
    tiporeport: string, fechadesde: string, fechahasta: string): Observable<RecetasGeneradas[]> {
    return this._http.post<RecetasGeneradas[]>(this.urlreporterecetasgeneradas, {
      'servidor': servidor,
      'hdgcodigo': hdgcodigo,
      'esacodigo': esacodigo,
      'cmecodigo': cmecodigo,
      'tiporeport': tiporeport,
      'usuario': usuario,
      'fechadesde': fechadesde,
      'fechahasta': fechahasta
    });
  }

  RPTImprimeConteoManualInventario(servidor: string, hdgcodigo: number, esacodigo: number, cmecodigo: number, usuario: string,
    tiporeport: string, grupo: number, fechagenerainv: string, tipoproductoinv: string, bodegainv: number): Observable<UrlReporte> {
    return this._http.post<UrlReporte>(this.urlobtieneurlconteomanualinventario, {
      servidor,
      hdgcodigo,
      esacodigo,
      cmecodigo,
      tiporeport,
      usuario,
      grupo,
      fechagenerainv,
      tipoproductoinv,
      bodegainv
    });
  }
}
