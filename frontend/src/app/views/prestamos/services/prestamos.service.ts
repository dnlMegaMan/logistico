import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConsularParam, ConsularParamData } from '../interfaces/consular-param.interface';
import { Observable } from 'rxjs';
import { BuscaProdPorDescripcion, BuscarPrestamo, Medicamento, PrestamoDet, RespuestaPrestamo } from '../interfaces/buscar-prod-por-descripcion.interface';
import { StockProducto } from 'src/app/models/entity/StockProducto';
import { UrlReporte } from 'src/app/models/entity/Urlreporte';
import { DevuelveDatosUsuario } from 'src/app/models/entity/DevuelveDatosUsuario';
import { environment } from 'src/environments/environment';
import { Privilegios } from 'src/app/models/entity/Privilegios';

@Injectable({ providedIn: 'root' })
export class PrestamosService {
  private urlconsularParamInitPrestamos: string = sessionStorage.getItem('enlace').toString().concat('/consularparaminitprestamos');
  private urlBuscaProdPorDescripcion: string = sessionStorage.getItem('enlace').toString().concat('/buscaprodpordescripcion');
  private urlConsultaproductolotes: string = sessionStorage.getItem('enlace').toString().concat('/consultaproductolotes');
  private urlBuscarPrestamos: string = sessionStorage.getItem('enlace').toString().concat('/buscarprestamos');
  private urlGetUrlReportePrestamos: string = sessionStorage.getItem('enlace').toString().concat('/geturlreporteprestamos');
  private urlGetUrlCrearPrestamo: string = sessionStorage.getItem('enlace').toString().concat('/crearprestamo');
  private urlGetUrlForzarCierrePrestamo: string = sessionStorage.getItem('enlace').toString().concat('/forzarcierreprestamo');
  private urlusuario = `${environment.URLServiciosRest.URLConexion}/validausuario`;
  private urlprivilegiousuario = `${environment.URLServiciosRest.URLConexion}/obtenerprivilegios`;

  constructor(private http: HttpClient) { };

  consularParamInitPrestamos(request: ConsularParamData): Observable<ConsularParam[]> {
    return this.http.post<ConsularParam[]>(this.urlconsularParamInitPrestamos, request)
  }

  consularBuscaProdPorDescripcion(request: BuscaProdPorDescripcion): Observable<Medicamento[]> {
    return this.http.post<Medicamento[]>(this.urlBuscaProdPorDescripcion, request)
  }

  consultarProductoLotes(request: BuscaProdPorDescripcion): Observable<PrestamoDet[]> {
    return this.http.post<PrestamoDet[]>(this.urlConsultaproductolotes, request)
  }

  consularBuscarPrestamos(request: BuscarPrestamo): Observable<RespuestaPrestamo> {
    return this.http.post<RespuestaPrestamo>(this.urlBuscarPrestamos, request);
  }

  rptImprimePrestamo(request: BuscarPrestamo): Observable<UrlReporte> {
    return this.http.post<UrlReporte>(this.urlGetUrlReportePrestamos, request);
  }

  crearPrestamo(request: RespuestaPrestamo): Observable<any> {
    return this.http.post<any>(this.urlGetUrlCrearPrestamo, request);
  }

  forzarCierrePrestamo(id: number, usuario: string, observaciones: string): Observable<any> {
    return this.http.post<any>(this.urlGetUrlForzarCierrePrestamo, {
      servidor: environment.URLServiciosRest.ambiente,
      id,
      usuario,
      observaciones
    });
  }

  autenticacionUsuario(usuario: string, clave: string): Promise<DevuelveDatosUsuario[]> {
    return this.http
      .post<DevuelveDatosUsuario[]>(this.urlusuario, {
        usuario,
        clave,
        servidor: environment.URLServiciosRest.ambiente,
      })
      .toPromise();
  }

  obtenerPrivilegios(idusuario: number,
    hdgcodigo: number,
    esacodigo: number,
    cmecodigo: number,
    usuario: string,
    servidor: string,) {
    return this.http
      .post<Privilegios[]>(this.urlprivilegiousuario, {
        idusuario: idusuario,
        hdgcodigo: hdgcodigo,
        esacodigo: esacodigo,
        cmecodigo: cmecodigo,
        usuario: usuario,
        servidor: servidor,
      })
      .toPromise();
  }

}
