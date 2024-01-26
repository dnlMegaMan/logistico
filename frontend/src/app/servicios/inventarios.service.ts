import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import 'rxjs/add/operator/map';
//import { DistribucionComprasEspeciales } from '../models/entity/DistribucionComprasEspeciales';
import { Observable } from 'rxjs';

import { GeneraInventarioSistema } from '../models/entity/GeneraInventarioSistema';
import { IngresoConteoManual } from '../models/entity/IngresoConteoManual';
import { InventarioDetalle } from '../models/entity/InventarioDetalle';
import { ConsultaKardex } from '../../app/models/entity/ConsultaKardex';
import { DetalleKardex } from '../../app/models/entity/DetalleKardex';
import { StockProducto } from '../models/entity/StockProducto';
import { RetornaMensaje } from '../models/entity/RetornaMensaje';
import { PeriodoCierreKardex } from '../models/entity/PeriodoCierreKardex';
import { GrabaAjustesInventario } from '../models/entity/GrabaAjuste';
import { RespuestaObtenerUltimoPeriodoInvenario } from '../models/entity/RespuestaObtenerUltimoPeriodoInvenario';
import { RespuestaCargarBodegasInventario } from '../models/entity/respuestaCargarBodegasInventario';
import { GuardarBloqueosBodegasInventario } from '../models/entity/GuardarBloqueosBodegasInventario';


@Injectable()
export class InventariosService {

  public urlgenerainv: string = sessionStorage.getItem('enlace').toString().concat('/generainventario');
  public urlperiodoinv: string = sessionStorage.getItem('enlace').toString().concat('/periodosinventarios');
  public urlperiodogenerarajusteinv: string = sessionStorage.getItem('enlace').toString().concat('/periodosgenerarajusteinventarios');
  public urlurlfiltroinventariovalorizado: string = sessionStorage.getItem('enlace').toString().concat('/periodosinventariovalorizado');
  public urlbuscainventario: string = sessionStorage.getItem('enlace').toString().concat('/ConsultaInventario');
  public urlgrabainventario: string = sessionStorage.getItem('enlace').toString().concat('/grabarinvmanual');
  public urlgrabaajuste: string = sessionStorage.getItem('enlace').toString().concat('/grabaajustes');
  public urlkardex: string = sessionStorage.getItem('enlace').toString().concat('/movimientoskardex');
  public urlDetalleKardex: string = sessionStorage.getItem('enlace').toString().concat('/buscadatoskardex');
  public urlBuscastock: string = sessionStorage.getItem('enlace').toString().concat('/buscastock');
  public urlactualizainventario: string = sessionStorage.getItem('enlace').toString().concat('/actualizainv');
  public urlcierrekardex: string = sessionStorage.getItem('enlace').toString().concat('/creacierrekardexbodega');
  public urlperocierrekardex: string = sessionStorage.getItem('enlace').toString().concat('/selperiodoscierrekardex');
  public urlconsultakardex: string = sessionStorage.getItem('enlace').toString().concat('/selcierrekardexprodbod');
  public urlcrearnuevoconteo: string = sessionStorage.getItem('enlace').toString().concat('/crearnuevoconteo');
  public urlcrearnuevoajusteinventario: string = sessionStorage.getItem('enlace').toString().concat('/crearnuevoajusteinventario');
  public urlobtenerultimoperiodoinventario: string = sessionStorage.getItem('enlace').toString().concat('/obtenerultimoperiodoinventario');
  public urlgestionarperiodoinventario: string = sessionStorage.getItem('enlace').toString().concat('/gestionarperiodoinventario');
  public urlcargarbodegasinventario: string = sessionStorage.getItem('enlace').toString().concat('/cargarbodegasinventario');
  public urlbloquearbodegasinventario: string = sessionStorage.getItem('enlace').toString().concat('/bloquearbodegasinventario');

    constructor(public _http: HttpClient) {

  }
  GeneraInventario(hdgcodigo: number, esacodigo: number, cmecodigo: number, fechagenerainv: string,
    bodegainv: number, tipoproductoinv: string, grupoinv: number, usuario: string, servidor: string
    ): Observable<GeneraInventarioSistema[]> {

    return this._http.post<GeneraInventarioSistema[]>(this.urlgenerainv, {
      hdgcodigo,
      esacodigo,
      cmecodigo,
      fechagenerainv,
      bodegainv,
      tipoproductoinv,
      grupoinv,
      usuario,
      servidor
    });
  }

  BuscaPeriodo( hdgcodigo: number, esacodigo: number, cmecodigo: number,bodegainv: number, usuario: string,
     servidor: string, ajustemanual: boolean = false): Observable<IngresoConteoManual[]> {

    return this._http.post<IngresoConteoManual[]>(this.urlperiodoinv, {
      hdgcodigo,
      esacodigo,
      cmecodigo,
      bodegainv,
      usuario,
      servidor,
      ajustemanual
    });
  }

  BuscaPeriodoGenerarAjuste( hdgcodigo: number, esacodigo: number, cmecodigo: number,bodegainv: number, usuario: string,
     servidor: string, ajustemanual: boolean = false): Observable<IngresoConteoManual[]> {

    return this._http.post<IngresoConteoManual[]>(this.urlperiodogenerarajusteinv, {
      hdgcodigo,
      esacodigo,
      cmecodigo,
      bodegainv,
      usuario,
      servidor,
      ajustemanual
    });
  }

  BuscaPeriodoInventarioValorizado( hdgcodigo: number, esacodigo: number, cmecodigo: number,bodegainv: number, usuario: string,
    servidor: string, ajustemanual: boolean = false): Observable<IngresoConteoManual[]> {

   return this._http.post<IngresoConteoManual[]>(this.urlurlfiltroinventariovalorizado, {
     hdgcodigo,
     esacodigo,
     cmecodigo,
     bodegainv,
     usuario,
     servidor,
     ajustemanual
   });
 }

  BuscaDetalleInventario(
    hdgcodigo: number, esacodigo: number, cmecodigo: number, fechagenerainv: string,
    bodegainv: number, tipoproductoinv: string, usuario: string,
    servidor: string, grupo: number = 0, pagenumber: number = 1, pagesize: number = 35
  ): Observable<InventarioDetalle[]> {

    return this._http.post<InventarioDetalle[]>(this.urlbuscainventario, {
      hdgcodigo,
      esacodigo,
      cmecodigo,
      fechagenerainv,
      bodegainv,
      tipoproductoinv,
      usuario,
      servidor,
      grupo,
      pagenumber,
      pagesize
    });
  }

  GrabaConteoManual(paraminvmanual, servidor): Observable<InventarioDetalle[]> {

    return this._http.post<InventarioDetalle[]>(this.urlgrabainventario, {
      paraminvmanual,
      servidor
    });
  }

  GrabaAjuste(paraminvajuste): Observable<InventarioDetalle[]> {

    return this._http.post<InventarioDetalle[]>(this.urlgrabaajuste, {
      paraminvajuste
    });
  }

  GrabaCierreKardex(hdgcodigo: number, esacodigo: number, cmecodigo: number, servidor: string, usuario: string,
    codbodega: number): Observable<RetornaMensaje[]> {
    return this._http.post<RetornaMensaje[]>(this.urlcierrekardex, {
      hdgcodigo,
      esacodigo,
      cmecodigo,
      servidor,
      usuario,
      codbodega,
    });
  }

  BuscaDatosKardex(periodo: string, bodegavigente: number, codigo: string, usuario: string, servidor: string): Observable<ConsultaKardex[]> {
    return this._http.post<ConsultaKardex[]>(this.urlkardex, {
      periodo,
      bodegavigente,
      codigo,
      usuario,
      servidor
    });
  }

  BuscaDetalleKardex(idmovimdet: number, idmovimdevol: number, idmovimdevptmo: number, idmovimpaciente: number, idmovimprestamos: number, idmovimdajustes: number, usuario: string, servidor: string): Observable<DetalleKardex[]> {
    return this._http.post<DetalleKardex[]>(this.urlDetalleKardex, {
      idmovimdet,
      idmovimdevol,
      idmovimdevptmo,
      idmovimpaciente,
      idmovimprestamos,
      idmovimdajustes,
      servidor,
      usuario
    });
  }

  BuscaStockProd(meinid: number, bodegaorigen: number, usuario: string, servidor: string): Observable<StockProducto[]> {
    return this._http.post<StockProducto[]>(this.urlBuscastock, {
      meinid,
      bodegaorigen,
      usuario,
      servidor
    });
  }

  ActualizaInventario(
    hdg: number,
    esa: number,
    cme: number,
    id: number,
    ajuste: number,
    usuarioid: number,
    usuario: string,
    servidor: string
    ): Observable<InventarioDetalle[]> {

    return this._http.post<InventarioDetalle[]>(this.urlactualizainventario, {
      hdgcodigo: hdg,
      esacodigo: esa,
      cmecodigo: cme,
      idinventario: id,
      ajusteinvent: ajuste,
      usuarioid,
      usuario,
      servidor
    });
  }

  BuscaPeriodoMedBodegas(hdgcodigo: number, esacodigo: number, cmecodigo: number, servidor: string,
    usuario: string, codbodega: number): Observable<PeriodoCierreKardex[]> {
    return this._http.post<PeriodoCierreKardex[]>(this.urlperocierrekardex, {
      hdgcodigo,
      esacodigo,
      cmecodigo,
      servidor,
      usuario,
      codbodega

    });
  }

  ConsultaKardex(hdgcodigo: number, esacodigo: number, cmecodigo: number, servidor: string, usuario: string,
    kadeid: number, codbodega: number, meinid: number): Observable<ConsultaKardex[]> {
    return this._http.post<ConsultaKardex[]>(this.urlconsultakardex, {
      hdgcodigo,
      esacodigo,
      cmecodigo,
      servidor,
      usuario,
      kadeid,
      codbodega,
      meinid
    });
  }

  CrearNuevoConteo(invid: number, habilitarconteo: number, servidor: string): Observable<RetornaMensaje> {
    return this._http.post<RetornaMensaje>(this.urlcrearnuevoconteo, {
      invid,
      habilitarconteo,
      servidor
    });
  }

  CrearNuevoAjusteInventario(detallesInventario: GrabaAjustesInventario): Observable<RetornaMensaje> {
    return this._http.post<RetornaMensaje>(this.urlcrearnuevoajusteinventario, detallesInventario);
  }

  ObtenerUltimoPeriodoInventario(hdgcodigo: number, esacodigo: number, cmecodigo: number, servidor: string):
    Observable<RespuestaObtenerUltimoPeriodoInvenario> {
    return this._http.post<RespuestaObtenerUltimoPeriodoInvenario>(this.urlobtenerultimoperiodoinventario, {
      hdgcodigo,
      esacodigo,
      cmecodigo,
      servidor
    });

  }

  CrearPeriodoInventario(
    hdgcodigo: number, esacodigo: number, cmecodigo: number,fecha: string, servidor: string, usuario: string
  ): Observable<RetornaMensaje> {
    return this._http.post<RetornaMensaje>(this.urlgestionarperiodoinventario, {
      hdgcodigo,
      esacodigo,
      cmecodigo,
      fecha,
      servidor,
      usuario
    });
  }

  CargarBodegasInventario(
    hdgcodigo: number, esacodigo: number, cmecodigo: number, servidor: string
  ): Observable<RespuestaCargarBodegasInventario[]> {
    return this._http.post<RespuestaCargarBodegasInventario[]>(this.urlcargarbodegasinventario, {
      hdgcodigo,
      esacodigo,
      cmecodigo,
      servidor
    });
  }

  GuardarBloqueosBodegasInventario(
    bodegasInventario: GuardarBloqueosBodegasInventario
  ): Observable<RetornaMensaje> {
    return this._http.post<RetornaMensaje>(this.urlbloquearbodegasinventario, bodegasInventario);
  }
}
