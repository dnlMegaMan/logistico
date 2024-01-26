import { Injectable } from '@angular/core';

import 'rxjs/add/operator/map';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { BodegaVigente } from '../models/entity/BodegaVigente';
import { StockProducto } from '../models/entity/StockProducto';
import { GrabaSolicitud } from '../models/entity/GrabaSolicitud';
import { environment } from '../../environments/environment';
import { Grabadetallesolicitudbod } from '../models/entity/Grabadetallesolicitudbod';
import { BodegaCargo } from '../models/entity/BodegaCargo';
import { StockProductoBodSuminWS } from '../models/entity/StockProductoBodSuminWS';


@Injectable()
export class CreasolicitudesService {

  public buscabodega: string = sessionStorage.getItem('enlace').toString().concat('/bodegas');//'http://172.25.108.236:8189/bodegas';
  public urlBuscastock: string = sessionStorage.getItem('enlace').toString().concat('/buscastock');//"http://172.25.108.236:8193/buscastock";
  public urlgrabasolic: string = sessionStorage.getItem('enlace').toString().concat('/grabarencabsolicitudbod');
  public urlgrabadetallesolic: string = sessionStorage.getItem('enlace').toString().concat('/grabardetasolicitudbod');
  public urlretornasolic: string = sessionStorage.getItem('enlace').toString().concat('/retornaencsolicitudbod');
  public urlbuscabodegaorigen: string = sessionStorage.getItem('enlace').toString().concat('/bodegascargo');
  public urlBuscastockws: string = sessionStorage.getItem('enlace').toString().concat('/wsconsultasaldo');

  constructor(public _http: HttpClient) {
  }


  BodegasVigentes(hdgcodigo: number, esacodigo: number, cmecodigo: number, usuario: string, servidor: string): Observable<BodegaVigente[]> {

    return this._http.post<BodegaVigente[]>(this.buscabodega, {
      'hdgcodigo': hdgcodigo,
      'esacodigo': esacodigo,
      'cmecodigo': cmecodigo,
      'usuario': usuario,
      'servidor': servidor
    });
  }

  BodegasOrigen(hdgcodigo: number, esacodigo: number, cmecodigo: number, usuario: string, servidor: string): Observable<BodegaCargo[]> {

    return this._http.post<BodegaCargo[]>(this.urlbuscabodegaorigen, {
      'hdgcodigo': hdgcodigo,
      'esacodigo': esacodigo,
      'cmecodigo': cmecodigo,
      'usuario': usuario,
      'servidor': servidor
    });
  }




  BuscaStockProd(hdgcodigo: number, esacodigo: number, cmecodigo: number, meinid: number, bodegaorigen: number, usuario: string, servidor: string): Observable<StockProducto[]> {
    return this._http.post<StockProducto[]>(this.urlBuscastock, {
      'hdgcodigo': hdgcodigo,
      'esacodigo': esacodigo,
      'cmecodigo': cmecodigo,
      'meinid': meinid,
      'bodegaorigen': bodegaorigen,
      'usuario': usuario,
      'servidor': servidor
    });
  }

  GrabaCreacionSolicitud(sboid: number, hdgcodigo: number, esacodigo: number, cmecodigo: number,
    bodegaorigen: number, bodegadestino: number, prioridadcod: number, esticod: number,
    usuariocrea: string, fechacrea: string, usuariomodif: string, fechamodif: string, usuarioelimina: string,
    fechaelimina: string, servidor: string): Observable<GrabaSolicitud[]> {
    return this._http.post<GrabaSolicitud[]>(this.urlgrabasolic, {
      'sboid': sboid,
      'hdgcodigo': hdgcodigo,
      'esacodigo': esacodigo,
      'cmecodigo': cmecodigo,
      'bodegaorigen': bodegaorigen,
      'bodegadestino': bodegadestino,
      'prioridadcod': prioridadcod,
      'esticod': esticod,
      'usuariocrea': usuariocrea,
      'fechacrea': fechacrea,
      'usuariomodif': usuariomodif,
      'fechamodif': fechamodif,
      'usuarioelimina': usuarioelimina,
      'fechaelimina': fechaelimina,
      'servidor': servidor
    });
  }

  GrabaCreacionDetalleSolicitud(grabadetsolicitudbod): Observable<Grabadetallesolicitudbod[]> {
    return this._http.post<Grabadetallesolicitudbod[]>(this.urlgrabadetallesolic, {
      'grabadetsolicitudbod': grabadetsolicitudbod
    });
  }

  retornaSolicitud(solbodid: number, servidor: string): Observable<GrabaSolicitud[]> {
    return this._http.post<GrabaSolicitud[]>(this.urlretornasolic, {
      'solbodid': solbodid,
      'servidor': servidor
    });
  }

  ConsultaSaldoWS(esacodigo: number, hdgcodigo: number, codbodega: number, codmei: string,
    servidor: string): Observable<StockProductoBodSuminWS> {
    return this._http.post<StockProductoBodSuminWS>(this.urlBuscastockws, {
      'esacodigo': esacodigo,
      'hdgcodigo': hdgcodigo,
      'codbodega': codbodega,
      'codmei': codmei,
      'servidor': servidor
    });
  }
}
