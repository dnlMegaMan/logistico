import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Periodo } from '../models/entity/Periodo';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { EstadoSolicitudBodega } from '../models/entity/EstadoSolicitudBodega';

@Injectable({
  providedIn: 'root'
})
export class EstadosolicitudbodegaService {

  private target_url = sessionStorage.getItem('enlace').toString().concat('/llenaestadossolbod');//'http://172.25.108.236:8187/periodos';

  constructor(public httpClient: HttpClient) {

  }

  public list(hdgcodigo:number,esacodigo:number,cmecodigo:number, usuario:string, servidor:string): Observable<EstadoSolicitudBodega[]> {
    return this.httpClient.post<EstadoSolicitudBodega[]>(this.target_url,{
      'hdgcodigo' : hdgcodigo,
      'esacodigo' : esacodigo,
      'cmecodigo' : cmecodigo,
      'usuario' : usuario,
      'servidor': servidor
    });
  }

}