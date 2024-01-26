import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Camas } from '../models/entity/Camas';
import { Piezas } from '../models/entity/Piezas';
import { Unidades } from '../models/entity/Unidades';
import { ServicioPaciente } from '../models/entity/ServicioPaciente';
import { Servicio } from '../models/entity/Servicio';
import { TipoOperacion } from '../models/entity/tipo-operacion';

@Injectable({
  providedIn: 'root'
})
export class EstructuraunidadesService {

  private urlListaUnidades = sessionStorage.getItem('enlace').toString().concat('/listaunidades');//'http://172.25.108.236:8189/bodegasparaasignar';
  private urlListaPiezas = sessionStorage.getItem('enlace').toString().concat('/listapiezas');
  private urlListaCamas = sessionStorage.getItem('enlace').toString().concat('/listacamas');
  private urlListaServicios = sessionStorage.getItem('enlace').toString().concat('/listaservicios');
  private target_url = sessionStorage.getItem('enlace').toString().concat('/servicios');

  private urlListaTipoOperacion = sessionStorage.getItem('enlace').toString().concat('/listatipooperacion');


  constructor(private httpClient: HttpClient) {
  }

  public BuscarUnidades(hdgcodigo: number, esacodigo: number, cmecodigo: number, usuario: string, servidor: string): 
  Observable<Unidades[]> {
    return this.httpClient.post<Unidades[]>(this.urlListaUnidades, {
      'hdgcodigo': hdgcodigo,
      'esacodigo': esacodigo,
      'cmecodigo': cmecodigo,
      'usuario': usuario,
      'servidor': servidor
    });
  }
  

  public list(usuario: string, servidor: string): Observable<Servicio[]> {
    return this.httpClient.post<Servicio[]>(this.target_url,{
      'usuario' : usuario,
      'servidor': servidor
    });
  }

  
  public BuscarServicios(hdgcodigo: number, esacodigo: number, cmecodigo: number, usuario: string, servidor: string,ambito:number,glosaservicio:string): 
  Observable<Servicio[]> {
    return this.httpClient.post<Servicio[]>(this.urlListaServicios, {
      'hdgcodigo': hdgcodigo,
      'esacodigo': esacodigo,
      'cmecodigo': cmecodigo,
      'usuario': usuario,
      'servidor': servidor,
      'ambito'  : ambito,
      'glosaservicio':glosaservicio,
    });
  }


  public BuscarPiezas(hdgcodigo: number, esacodigo: number, cmecodigo: number, idunidad: number, usuario: string, servidor: string,serviciocod:string):
   Observable<Piezas[]> {
    return this.httpClient.post<Piezas[]>(this.urlListaPiezas, {
      'hdgcodigo': hdgcodigo,
      'esacodigo': esacodigo,
      'cmecodigo': cmecodigo,
      'idunidad': idunidad,
      'usuario': usuario,
      'servidor': servidor,
      'serviciocod':serviciocod,
    });
  }

  public BuscarCamas(hdgcodigo: number, esacodigo: number, cmecodigo: number, idpieza: number, usuario: string, servidor: string): Observable<Camas[]> {
    return this.httpClient.post<Camas[]>(this.urlListaCamas, {
      'hdgcodigo': hdgcodigo,
      'esacodigo': esacodigo,
      'cmecodigo': cmecodigo,
      'idpieza': idpieza,
      'usuario': usuario,
      'servidor': servidor
    });
  }

  
  public BuscarTipoOperacion(hdgcodigo: number, esacodigo: number, cmecodigo: number, usuario: string, servidor: string): Observable<TipoOperacion[]> {
    return this.httpClient.post<TipoOperacion[]>(this.urlListaTipoOperacion, {
      hdgcodigo: hdgcodigo,
      esacodigo: esacodigo,
      cmecodigo: cmecodigo,
      usuario: usuario,
      servidor: servidor,
    });
  }
}