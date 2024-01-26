import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ServicioLogistico } from '../models/entity/ServicioLogistico';
import { Servreglas } from '../models/entity/servicioreglas/servreglas';
import { ServicioConReglas, ServicioMantenedorReglas } from '../models/entity/servicios-mantenedor-reglas';


@Injectable({
  providedIn: 'root'
})
export class ServicioService {
  private urlBusquedaReglasPorServicio = sessionStorage.getItem('enlace').toString().concat('/buscareglasporcodigoservicio');
  private urlBuscarServiciosMantenedorReglas = sessionStorage.getItem('enlace').toString().concat('/buscarserviciosmantenedordereglas');
  private urlGrabarReglas = sessionStorage.getItem('enlace').toString().concat('/grabarreglasdeservicio');

  private url_busquedaservicioreglas = sessionStorage.getItem('enlace').toString().concat('/busquedaservicioreglas');
  private url_servicioporbodega = sessionStorage.getItem('enlace').toString().concat('/servicioporbodega');

  constructor(public httpClient: HttpClient) { }

  private obtenerHES() {
    return {
      hdgcodigo: Number(sessionStorage.getItem('hdgcodigo').toString()),
      esacodigo: Number(sessionStorage.getItem('esacodigo').toString()),
      cmecodigo: Number(sessionStorage.getItem('cmecodigo').toString()),
      usuario: sessionStorage.getItem('Usuario').toString(),
      servidor: environment.URLServiciosRest.ambiente,
    };
  }

  /**
   * @param conReglas 
   * `true` para incluir servicios que ya tienen reglas asociadas. `false` para servicios que 
   * no tienen reglas asociadas.
   * 
   * @param textoBusqueda 
   * El código o descripcion del servicio. No es necesario que sea exacto.
   */
  buscarServiciosMantenedorDeReglas(conReglas: boolean, textoBusqueda: string = "") {
    return this.httpClient.post<ServicioMantenedorReglas[]>(this.urlBuscarServiciosMantenedorReglas, {
      ...this.obtenerHES(),
      conReglas,
      textoBusqueda,
    });
  }

  buscaReglasPorServicio(codigoServicio: string): Observable<ServicioConReglas[]>  {
    return this.httpClient.post<ServicioConReglas[]>(this.urlBusquedaReglasPorServicio, {
      ...this.obtenerHES(),
      codigoServicio,
    });
  }

  modificarReglas(
    reglaId: number, bodegaServicio: number,bodegaMedicamento: number, bodegaInsumos: number, 
    bodegaControlados: number, bodegaConsignacion: number, codigoServicio: string, 
    centroDeCosto: number, centroDeConsumo: number,
  ): Observable<any> {
    return this.httpClient.post<any>(this.urlGrabarReglas, {
      ...this.obtenerHES(),
      modificarRegla: true,
      reglaId,
      codigoServicio,
      bodegaServicio,
      bodegaMedicamento,
      bodegaInsumos,
      bodegaControlados,
      bodegaConsignacion,
      centroDeCosto,
      centroDeConsumo,
    });
  }

  crearReglas(
    codigoServicio: string, bodegaServicio: number,bodegaMedicamento: number, bodegaInsumos: number, 
    bodegaControlados: number, bodegaConsignacion: number, centroDeCosto: number, 
    centroDeConsumo: number,
  ): Observable<any> {
    return this.httpClient.post<any>(this.urlGrabarReglas, {
      ...this.obtenerHES(),
      modificarRegla: false,
      codigoServicio,
      bodegaServicio,
      bodegaMedicamento,
      bodegaInsumos,
      bodegaControlados,
      bodegaConsignacion,      
      centroDeCosto,
      centroDeConsumo,
    });
  }


  busquedaservreglas(
    hdgcodigo:number, esacodigo:number, cmecodigo:number, usuario:string, servidor:string, 
    ambito:number, glosaservicio:string, codigoservicio:string,
  ): Observable<Servreglas[]> {
    return this.httpClient.post<Servreglas[]>(this.url_busquedaservicioreglas, {
      'hdgcodigo' : hdgcodigo,
      'esacodigo' : esacodigo,
      'cmecodigo' : cmecodigo,
      'usuario' : usuario,
      'servidor': servidor,
      'ambito'  : ambito,
      'glosaservicio':glosaservicio,
      'codigoservicio':codigoservicio
    });
  }
  
  servicioporbodega(
    usuario:string, servidor:string, hdgcodigo:number, esacodigo:number, cmecodigo:number, 
    bodcodigo: number, 
  ): Observable<ServicioLogistico[]> {
    return this.httpClient.post<ServicioLogistico[]>(this.url_servicioporbodega, {
      'usuario'   : usuario,
      'servidor'  : servidor,
      'hdgcodigo' : hdgcodigo,
      'esacodigo' : esacodigo,
      'cmecodigo' : cmecodigo,
      'bodcodigo' : bodcodigo,
    });
  }
}
