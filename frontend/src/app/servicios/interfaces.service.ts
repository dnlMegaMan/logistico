import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { MovimientoInterfaz } from '../models/entity/movimiento-interfaz';
import { DISPENSACIONRECETAS } from '../models/entity/dispensacion-recetas';
import { RespustaTransaccion } from '../models/entity/RespuestaTransaccion';
import { MovimientoInterfazBodegas } from '../models/entity/movimiento-interfaz-bodegas';
import { EstructuraFin700 } from '../models/entity/estructura-fin700';
import { RespuestaErp } from '../models/entity/respuesta-erp';
import { SolicitudConsumo } from '../models/entity/solicitud-consumo';
import { ConsultaSolConsumoERP } from '../models/entity/consulta-sol-consumo-erp';
import { EstadosTraspasosFin700 } from '../models/entity/EstadosTraspasosFin700';
import { AnulacionDespacho } from '../models/entity/AnulacionDespacho';

@Injectable()
export class InterfacesService {
  public urllistamoviminetointerfaz: string = sessionStorage.getItem('enlace').toString().concat('/listarmovimientointerfaz');
  public urllistamoviminetointerfazcargo: string = sessionStorage.getItem('enlace').toString().concat('/listarmovimientointerfazcargo');
  public urlenviacargossisalud: string = sessionStorage.getItem('enlace').toString().concat('/enviacargossisalud');
  public urledispensacionRecetalegado: string = sessionStorage.getItem('enlace').toString().concat('/dispensacionRecetalegado');
  public urllistarmovimientointerfazbodegas: string = sessionStorage.getItem('enlace').toString().concat('/listarmovimientointerfazbodegas');
  public urlenviarmovimientosFin700Masivo: string = sessionStorage.getItem('enlace').toString().concat('/enviarmovimientosfin700');
  public urlwsLogIntegraPedido: string = sessionStorage.getItem('enlace').toString().concat('/wsLogIntegraPedido');
  public url_buscarsolicitudacentrales = sessionStorage.getItem('enlace').toString().concat('/interfazsolicitudesacentrales');
  public url_buscaestadosf700 : string = sessionStorage.getItem('enlace').toString().concat('/selestadostraspasosfin700');
  public urllistarmovimientointerfazbodegascab : string = sessionStorage.getItem('enlace').toString().concat('/listarmovimientointerfazbodegascab');
  public urllistarmovimientointerfazpacientecab : string = sessionStorage.getItem('enlace').toString().concat('/listarmovimientointerfazpacientecab');
  public urlAnularDispensacionReceta : string = sessionStorage.getItem('enlace').toString().concat('/listaanulardispensacionreceta');
  public urlEnvioMasicoFin700 = sessionStorage.getItem('enlace').toString().concat('/enviarmovimientosFin700Masivo');

  constructor(public _http: HttpClient) {

  }


  listamovimientointerfaz(_movimientoInterfaz: MovimientoInterfaz): Observable<MovimientoInterfaz[]> {
    return this._http.post<MovimientoInterfaz[]>(this.urllistamoviminetointerfaz, _movimientoInterfaz)

  }

  listarmovimientointerfazbodegas(_movimientoInterfaz: MovimientoInterfazBodegas): Observable<MovimientoInterfazBodegas[]> {
    return this._http.post<MovimientoInterfazBodegas[]>(this.urllistarmovimientointerfazbodegas, _movimientoInterfaz)

  }

  listamovimientointerfazcargo(_movimientoInterfaz: MovimientoInterfaz): Observable<MovimientoInterfaz[]> {
    return this._http.post<MovimientoInterfaz[]>(this.urllistamoviminetointerfazcargo, _movimientoInterfaz)

  }

  enviacargossisalud(esacodigo:number, hdgcodigo: Number, idMovimiento: Number,
    idDetalleMovimiento: Number, IDDevolucion: Number, servidor: string): Observable<MovimientoInterfaz[]> {
    return this._http.post<MovimientoInterfaz[]>(this.urlenviacargossisalud, {
      "esacodigo": esacodigo,
      "hdgcodigo": hdgcodigo,
      "idmovimiento": idMovimiento,
      "idmovdet": idDetalleMovimiento,
      "iddevolucion": IDDevolucion,
      "servidor": servidor});
  }

  dispensacionRecetalegado(_dispensaciponreceta: DISPENSACIONRECETAS): Observable<RespustaTransaccion> {
    return this._http.post<RespustaTransaccion>(this.urledispensacionRecetalegado, _dispensaciponreceta)

  }

  enviarErp(_estructura_Fin700: EstructuraFin700): Observable<RespuestaErp> {
    return this._http.post<RespuestaErp>(this.urlenviarmovimientosFin700Masivo, _estructura_Fin700)

  }

  wsLogIntegraPedido(_ConsultaSolConsumoERP: ConsultaSolConsumoERP): Observable<RespuestaErp> {
    return this._http.post<RespuestaErp>(this.urlwsLogIntegraPedido, _ConsultaSolConsumoERP)

  }

  buscarsolicitudacentrales(hdgcodigo: number, esacodigo: number, cmecodigo: number,
    usuario: string, servidor: string, fechainicio: string, fechafin: string
  ): Observable<SolicitudConsumo[]> {
    return this._http.post<SolicitudConsumo[]>(this.url_buscarsolicitudacentrales, {
      'hdgcodigo': hdgcodigo,
      'esacodigo': esacodigo,
      'cmecodigo': cmecodigo,
      'usuario'  : usuario,
      'servidor' : servidor,
      'fechainicio': fechainicio,
      'fechafin' : fechafin
    });
  }

  EstadosTraspasosFin700(usuario: string, servidor: string): Observable<EstadosTraspasosFin700[]> {
    return this._http.post<EstadosTraspasosFin700[]>(this.url_buscaestadosf700, {
      'usuario'  : usuario,
      'servidor' : servidor
    });
  }

  listarmovimientointerfazbodegascab(_movimientoInterfaz: MovimientoInterfazBodegas): Observable<MovimientoInterfazBodegas[]> {
    return this._http.post<MovimientoInterfazBodegas[]>(this.urllistarmovimientointerfazbodegascab, _movimientoInterfaz)
  }

  listamovimientointerfazpacientecab(_movimientoInterfaz: MovimientoInterfazBodegas): Observable<MovimientoInterfaz[]> {
    return this._http.post<MovimientoInterfaz[]>(this.urllistarmovimientointerfazpacientecab, _movimientoInterfaz)
  }

  listaAnularDispensacionReceta(hdgcodigo: number, esacodigo: number, cmecodigo: number, usuario: string, servidor: string): Observable<AnulacionDespacho[]> {
    return this._http.post<AnulacionDespacho[]>(this.urlAnularDispensacionReceta, {
      'hdgcodigo'         : hdgcodigo,
      'esacodigo'         : esacodigo,
      'cmecodigo'         : cmecodigo,
      'usuario'           : usuario,
      'servidor'          : servidor,
    });
  }

  /**
   * @param fecha Con formato 'dd-MM-yyy'
   */
  envioMasivoFin700(hdgcodigo: number, esacodigo: number, cmecodigo: number, usuario: string, servidor: string, fechaDesde: string): Observable<any> {
    return this._http
      .post<any>(this.urlEnvioMasicoFin700, {
        hdgcodigo,
        esacodigo,
        cmecodigo, 
        usuario,
        servidor,
        fechaDesde,
      })
  }
}



